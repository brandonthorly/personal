import {IHttpTranslation} from '../../models/interfaces/http/http-translation.interface';

export function httpResponseTranslator(o: object, translator: { [key: string]: IHttpTranslation }): any {
  try {
    for (const k in o) {
      if (o.hasOwnProperty(k)) {
        if (translator.hasOwnProperty(k)) {
          const translation: IHttpTranslation = translator[k];
          const newKey: string = translation.value;
          const subTranslator: any = translation.subTranslator;

          o = {...o};
          o[newKey] = o[k];

          if (translation.isDate) {
            o[newKey] = new Date(o[newKey])

          } else if (subTranslator) {
            if (Array.isArray(o[newKey])) {
              o[newKey] = o[newKey].map(v => httpResponseTranslator(v, subTranslator));

            } else if (translation.isKeyValue) {
              Object.keys(o[newKey]).forEach(subKey => {
                o[newKey] = {...o[newKey]};

                if (Array.isArray(o[newKey][subKey])) {
                  o[newKey][subKey] = o[newKey][subKey].map(v => httpResponseTranslator(v, subTranslator));

                } else {
                  o[newKey][subKey] = httpResponseTranslator(o[newKey][subKey], subTranslator)
                }
              });

            } else {
              o[newKey] = httpResponseTranslator(o[newKey], subTranslator);
            }
          }

          if (newKey !== k) {
            delete o[k];
          }

        } else {
          o = {...o};
          if (o[k]) delete o[k];
        }
      }
    }

  } catch (e) {
    console.warn('Unable to translate object, ', o, '. Error, ', e);
  }

  return o;
}
