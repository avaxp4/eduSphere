import React, { useState, useEffect } from "react";
import {
  Facebook,
  Mail,
  User,
  Phone,
  Send,
  MessageCircle,
} from "lucide-react";
import { loadDevelopers, loadFooterData } from "../constants";

const Footer: React.FC = () => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [footerData, setFooterData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [devs, footer] = await Promise.all([
          loadDevelopers(),
          loadFooterData(),
        ]);
        setDevelopers(devs);
        setFooterData(footer);
      } catch (error) {
        console.error("Error loading footer data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderSocialLinks = (links: any) => {
    const linkComponents: React.ReactNode[] = [];

    if (links.facebook) {
      linkComponents.push(
        <a
          key="facebook"
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-brand-blue transition-colors"
          aria-label="فيسبوك"
        >
          <Facebook className="w-6 h-6" />
        </a>
      );
    }

    if (links.whatsapp) {
      linkComponents.push(
        <a
          key="whatsapp"
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-green-500 transition-colors"
          aria-label="واتساب"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      );
    }

    if (links.telegram) {
      linkComponents.push(
        <a
          key="telegram"
          href={links.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-400 transition-colors"
          aria-label="تيليجرام"
        >
          <Send className="w-6 h-6" />
        </a>
      );
    }

    return linkComponents.length > 0 ? (
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {linkComponents}
      </div>
    ) : null;
  };

  const primaryDeveloper =
    developers.find((dev) => dev.id === 1) || developers[0];

  return (
    <footer
      className="bg-dark-card border-t-2 border-dark-border mt-16 py-8"
      dir="rtl"
    >
      <div className="container mx-auto px-4 sm:px-6 text-center text-gray-400">
        <h2 className="text-2xl font-bold text-white mb-4">نبذة عن المنصة</h2>
        <p className="max-w-3xl mx-auto mb-6 text-sm sm:text-base">
          {footerData.description}
        </p>

        {/* Developer Information */}
        {primaryDeveloper && (
          <div className="flex flex-col items-center justify-center space-y-2 mb-6">
            <div className="flex items-center space-i-2">
              <User className="w-5 h-5 text-brand-gold" />
              <span>المطور: {primaryDeveloper.name}</span>
            </div>

            {/* Social Links for Primary Developer */}
            {primaryDeveloper.socialLinks &&
              renderSocialLinks(primaryDeveloper.socialLinks)}
          </div>
        )}

        {/* Contact Information */}
        {(footerData.contact?.email || footerData.contact?.phone) && (
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {footerData.contact.email && (
              <div className="flex items-center space-i-2">
                <Mail className="w-5 h-5 text-brand-gold" />
                <a
                  href={`mailto:${footerData.contact.email}`}
                  className="hover:text-brand-blue transition-colors text-sm sm:text-base"
                >
                  {footerData.contact.email}
                </a>
              </div>
            )}

            {footerData.contact.phone && (
              <div className="flex items-center space-i-2">
                <Phone className="w-5 h-5 text-brand-gold" />
                <span className="text-sm sm:text-base">
                  {footerData.contact.phone}
                </span>
              </div>
            )}
          </div>
        )}

        {/* School Social Links */}
        <p>المدرسة</p>
        <br />
        {footerData.schoolSocialLinks &&
          renderSocialLinks(footerData.schoolSocialLinks)}

        <p className="mt-8 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {footerData.copyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
