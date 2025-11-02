import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Image as ImageIcon, Video, FileText, Download, ZoomIn, AlignLeft, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isValidIframeUrl } from '@/config/iframe-sources';

interface Module {
  id: string;
  name: string;
  description: string | null;
  subject_id: string;
}

interface Subject {
  id: string;
  name: string;
  color: string | null;
}

interface Media {
  id: string;
  title: string;
  description: string | null;
  media_type: 'image' | 'video' | 'document' | 'text' | 'iframe';
  url: string | null;
  content: string | null;
  file_size: number | null;
}

const Module = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchModuleData();
    }
  }, [user, id]);

  const fetchModuleData = async () => {
    try {
      // Fetch module details
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .single();

      if (moduleError) throw moduleError;
      setModule(moduleData);

      // Fetch subject details
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', moduleData.subject_id)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Fetch media
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .eq('module_id', id)
        .order('created_at', { ascending: false });

      if (mediaError) throw mediaError;
      setMedia(mediaData || []);
    } catch (error) {
      console.error('Error fetching module data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    // Validate YouTube URL format
    const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(YOUTUBE_REGEX);

    if (!match) {
      console.warn('Invalid YouTube URL:', url);
      return null;
    }

    const videoId = match[4];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const handleImageClick = (image: Media) => {
    setSelectedImage(image);
    setImageDialogOpen(true);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !module || !subject) {
    return null;
  }

  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');
  const documents = media.filter(m => m.media_type === 'document');
  const textContents = media.filter(m => m.media_type === 'text');
  const iframes = media.filter(m => m.media_type === 'iframe');

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      {/* Module Header */}
      <section
        className="py-12 px-4"
        style={{
          background: `linear-gradient(135deg, ${subject.color || 'hsl(var(--primary))'}, ${subject.color || 'hsl(var(--secondary))'})`
        }}
      >
        <div className="container">
          <Link to={`/subject/${subject.id}`}>
            <Button variant="ghost" className="mb-4 text-white hover:text-white/80 hover:bg-white/10">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى {subject.name}
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{module.name}</h1>
          {module.description && (
            <p className="text-white/90 text-lg">{module.description}</p>
          )}
        </div>
      </section>

      {/* Media Content */}
      <section className="container py-12">
        <Tabs defaultValue={videos.length > 0 ? 'videos' : images.length > 0 ? 'images' : documents.length > 0 ? 'documents' : textContents.length > 0 ? 'text' : 'iframe'}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              فيديوهات ({videos.length})
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              صور ({images.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              ملفات ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <AlignLeft className="h-4 w-4" />
              نصي ({textContents.length})
            </TabsTrigger>
            <TabsTrigger value="iframe" className="gap-2">
              <Code className="h-4 w-4" />
              مضمن ({iframes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-6">
            {videos.length === 0 ? (
              <Card className="p-12 text-center shadow-card">
                <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">لا توجد فيديوهات متاحة</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {videos.map((video) => {
                  const embedUrl = video.url ? getYouTubeEmbedUrl(video.url) : null;

                  return (
                    <Card key={video.id} className="overflow-hidden shadow-card">
                      {embedUrl ? (
                        <div className="aspect-video">
                          <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allowFullScreen
                            title={video.title}
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <div className="text-center p-6">
                            <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">رابط الفيديو غير صالح</p>
                          </div>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{video.title}</CardTitle>
                        {video.description && (
                          <CardDescription>{video.description}</CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            {images.length === 0 ? (
              <Card className="p-12 text-center shadow-card">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">لا توجد صور متاحة</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden shadow-card hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted relative group cursor-pointer" onClick={() => handleImageClick(image)}>
                      {image.url && (
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{image.title}</CardTitle>
                      {image.description && (
                        <CardDescription>{image.description}</CardDescription>
                      )}
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            image.url && handleDownload(image.url, image.title);
                          }}
                          className="w-full"
                          disabled={!image.url}
                        >
                          <Download className="h-4 w-4 ml-2" />
                          تحميل الصورة
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {documents.length === 0 ? (
              <Card className="p-12 text-center shadow-card">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">لا توجد ملفات متاحة</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{doc.title}</CardTitle>
                            {doc.description && (
                              <CardDescription>{doc.description}</CardDescription>
                            )}
                            {doc.file_size && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatFileSize(doc.file_size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={doc.url || '#'} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" disabled={!doc.url}>
                              <FileText className="h-4 w-4 ml-2" />
                              عرض
                            </Button>
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => doc.url && handleDownload(doc.url, doc.title)}
                            disabled={!doc.url}
                          >
                            <Download className="h-4 w-4 ml-2" />
                            تحميل
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-6">
            {textContents.length === 0 ? (
              <Card className="p-12 text-center shadow-card">
                <AlignLeft className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">لا يوجد محتوى نصي متاح</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {textContents.map((textContent) => (
                  <Card key={textContent.id} className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-xl">{textContent.title}</CardTitle>
                      {textContent.description && (
                        <CardDescription>{textContent.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: textContent.content || '' }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="iframe" className="space-y-6">
            {iframes.length === 0 ? (
              <Card className="p-12 text-center shadow-card">
                <Code className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">لا يوجد محتوى مضمن متاح</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {iframes.map((iframe) => {
                  const isValid = iframe.url && isValidIframeUrl(iframe.url);

                  return (
                    <Card key={iframe.id} className="overflow-hidden shadow-card">
                      <CardHeader>
                        <CardTitle className="text-xl">{iframe.title}</CardTitle>
                        {iframe.description && (
                          <CardDescription>{iframe.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {isValid && iframe.url ? (
                          <div className="aspect-video w-full rounded-lg overflow-hidden border">
                            <iframe
                              src={iframe.url}
                              className="w-full h-full"
                              allowFullScreen
                              title={iframe.title}
                              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                            <div className="text-center p-6">
                              <Code className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">رابط المحتوى المضمن غير صالح</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl w-full p-0" dir="rtl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{selectedImage?.title}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="p-6">
              <div className="relative w-full max-h-[70vh] overflow-auto bg-muted rounded-lg">
                {selectedImage.url && (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="w-full h-auto object-contain"
                  />
                )}
              </div>
              {selectedImage.description && (
                <p className="mt-4 text-muted-foreground">{selectedImage.description}</p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => selectedImage.url && handleDownload(selectedImage.url, selectedImage.title)}
                  disabled={!selectedImage.url}
                >
                  <Download className="h-4 w-4 ml-2" />
                  تحميل الصورة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Module;
