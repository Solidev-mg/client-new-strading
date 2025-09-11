import frMessages from "../app/modules/auth/infrastructure/i18n/locales/fr.json";

type MessagesType = typeof frMessages;

export function useTranslations(namespace: string) {
  const getNestedValue = (obj: MessagesType, path: string): string => {
    const keys = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path; // Retourne la clé si pas trouvé
      }
    }
    
    return typeof current === 'string' ? current : path;
  };

  const t = (key: string): string => {
    const fullKey = `${namespace}.${key}`;
    return getNestedValue(frMessages, fullKey);
  };

  return t;
}
