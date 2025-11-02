import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, ArrowRight, MessageCircle, Mail, Clock, HelpCircle } from "lucide-react";

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

const Contact = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetch("/data/footer.json")
      .then((response) => response.json())
      .then((data) => setFooterData(data))
      .catch((error) => console.error("Error loading footer data:", error));
  }, []);

  const developerName = footerData?.developer
    ? `${footerData.developer.firstName}${footerData.developer.lastName}`
    : "Avax43";

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="gradient-hero p-4 rounded-lg w-fit mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">تواصل معنا</h1>
            <p className="text-muted-foreground text-lg">
              نحن هنا لمساعدتك في أي استفسار أو مشكلة تواجهها
            </p>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Developer Info Card */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>المطور</CardTitle>
                    <CardDescription>{developerName}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  للتسجيل في المنصة أو حل أي مشكلة تقنية، يمكنك التواصل معنا مباشرة عبر:
                </p>
                <div className="flex flex-col gap-3">
                  {footerData?.developer?.contact?.whatsapp && (
                    <a
                      href={footerData.developer.contact.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full justify-start gap-3" size="lg">
                        <svg className="h-5 w-5 fill-current text-green-600" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        واتساب
                        <ArrowRight className="mr-auto h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {footerData?.developer?.contact?.telegram && (
                    <a
                      href={footerData.developer.contact.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full justify-start gap-3" size="lg">
                        <svg className="h-5 w-5 fill-current text-blue-600" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                        تليجرام
                        <ArrowRight className="mr-auto h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help & Support Card */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>المساعدة والدعم</CardTitle>
                    <CardDescription>معلومات مهمة للمستخدمين</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    أوقات الاستجابة
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    نسعى للرد على استفساراتكم في أقرب وقت ممكن، عادة خلال 24 ساعة
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    حالات التواصل
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>إعادة ضبط كلمة المرور</li>
                    <li>مشاكل في تسجيل الدخول</li>
                    <li>الدعم الفني</li>
                    <li>الاستفسارات العامة</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <div className="space-y-4 mb-6">
            <Alert>
              <AlertTitle>إعادة ضبط كلمة المرور</AlertTitle>
              <AlertDescription>
                إذا نسيت كلمة المرور الخاصة بك أو تواجه مشكلة في تسجيل الدخول، يرجى التواصل معنا
                عبر واتساب أو تليجرام مع ذكر عنوان بريدك الإلكتروني، وسنساعدك في إعادة ضبط
                كلمة المرور في أقرب وقت ممكن.
              </AlertDescription>
            </Alert>

            <Alert variant="default">
              <AlertTitle>التسجيل في المنصة</AlertTitle>
              <AlertDescription>
                للتسجيل في منصة EduSphere، يمكنك الذهاب إلى صفحة التسجيل وإنشاء حساب جديد.
                إذا واجهت أي مشكلة أثناء عملية التسجيل، لا تتردد في التواصل معنا.
              </AlertDescription>
            </Alert>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                <BookOpen className="h-4 w-4 ml-2" />
                الذهاب إلى صفحة التسجيل
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                العودة إلى الصفحة الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;



