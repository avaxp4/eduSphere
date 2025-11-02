import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, MessageCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import heroImage from "@/assets/hero-education.jpg";

interface DeveloperContact {
  whatsapp?: string;
  telegram?: string;
}

interface Developer {
  firstName: string;
  lastName: string;
  contact?: DeveloperContact;
}

interface FooterData {
  developer?: Developer;
}

const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" })
    .max(100),
  email: z
    .string()
    .trim()
    .email({ message: "البريد الإلكتروني غير صحيح" })
    .max(255),
  password: z
    .string()
    .min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" })
    .max(100),
});

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "البريد الإلكتروني غير صحيح" })
    .max(255),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
});

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetch("/data/footer.json")
      .then((response) => response.json())
      .then((data) => setFooterData(data))
      .catch((error) => console.error("Error loading footer data:", error));
  }, []);

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      signUpSchema.parse(data);

      const { error } = await signUp(data.email, data.password, data.fullName);

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("هذا البريد الإلكتروني مسجل بالفعل", {
            description: "يمكنك تسجيل الدخول أو التواصل معنا للمساعدة",
            action: {
              label: "التواصل معنا",
              onClick: () => navigate("/contact"),
            },
          });
        } else {
          toast.error("حدث خطأ أثناء التسجيل", {
            description: error.message,
            action: {
              label: "التواصل معنا",
              onClick: () => navigate("/contact"),
            },
          });
        }
      } else {
        toast.success(
          "تم إرسال رسالة التفعيل إلى بريدك من Supabase Auth، يرجى التحقق من بريدك لتفعيل الحساب."
        );
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      signInSchema.parse(data);

      const { error } = await signIn(data.email, data.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة", {
            description: "إذا نسيت كلمة المرور، يرجى التواصل مع المشرفين لإعادة ضبطها",
            action: {
              label: "التواصل معنا",
              onClick: () => navigate("/contact"),
            },
            duration: 5000,
          });
        } else {
          toast.error("حدث خطأ أثناء تسجيل الدخول", {
            description: error.message,
            action: {
              label: "التواصل معنا",
              onClick: () => navigate("/contact"),
            },
          });
        }
      } else {
        toast.success("مرحباً بك!");
        navigate("/");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroImage}
          alt="منصة EduSphere"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center text-white p-8">
          <div className="text-center">
            <BookOpen className="h-20 w-20 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">EduSphere</h1>
            <p className="text-xl">رحلة تعليمية ممتعة ومنظمة لجميع الطلاب</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="gradient-hero p-3 rounded-lg w-fit mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">مرحباً بك</CardTitle>
            <CardDescription>سجل الدخول أو أنشئ حساباً جديداً</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="student@school.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">كلمة المرور</Label>
                      <Link
                        to="/contact"
                        className="text-sm text-primary hover:underline"
                      >
                        نسيت كلمة المرور؟
                      </Link>
                    </div>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    variant="hero"
                    disabled={loading}
                  >
                    {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                  <div className="text-center mt-4">
                    <Link
                      to="/contact"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline inline-flex items-center gap-1"
                    >
                      تحتاج مساعدة؟ تواصل معنا
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">الاسم الكامل</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="أحمد محمد"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="student@gmail.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">كلمة المرور</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="6 أحرف على الأقل"
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    variant="hero"
                    disabled={loading}
                  >
                    {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                  </Button>
                  <div className="text-center mt-4">
                    <Link
                      to="/contact"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline inline-flex items-center gap-1"
                    >
                      تحتاج مساعدة؟ تواصل معنا
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {/* Developer Info Section */}
            {footerData?.developer && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-3 justify-center mb-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {footerData.developer.firstName}
                      {footerData.developer.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">المطور</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  {footerData.developer.contact?.whatsapp && (
                    <a
                      href={footerData.developer.contact.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                      title="واتساب"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </a>
                  )}
                  {footerData.developer.contact?.telegram && (
                    <a
                      href={footerData.developer.contact.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                      title="تليجرام"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </a>
                  )}
                </div>
                <div className="text-center mt-3">
                  <Link
                    to="/contact"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline inline-flex items-center gap-1"
                  >
                    صفحة التواصل الكاملة
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
