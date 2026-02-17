import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ur' ? 'en' : 'ur';
        i18n.changeLanguage(newLang);
    };

    const isUrdu = i18n.language === 'ur';

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="gap-1.5 px-2 sm:px-3 border-border/60 hover:bg-secondary/60 font-medium"
        >
            <Languages className="w-4 h-4" />
            <span className="text-xs sm:text-sm">
                {isUrdu ? 'EN' : 'اردو'}
            </span>
        </Button>
    );
}
