export type PolicyContent = {
    title: string;
    lastUpdated: string;
    sections: { heading: string; body: string }[];
};

export type PoliciesDict = {
    [key: string]: PolicyContent;
};

export type LocalePolicies = {
    en: PoliciesDict;
    tr: PoliciesDict;
};

export const policies: LocalePolicies = {
    en: {
        licence: {
            title: "Licence Agreement",
            lastUpdated: "July 8, 2026",
            sections: [
                {
                    heading: "1. Grant of License",
                    body: "Subject to the terms of this Agreement, GitDeep grants you a limited, non-exclusive, non-transferable license to use the Software."
                },
                {
                    heading: "2. Restrictions",
                    body: "You may not reverse engineer, decompile, disassemble, or circumvent the technical restrictions of the Software, nor may you sell, rent, or lease the Software."
                },
                {
                    heading: "3. Intellectual Property",
                    body: "The Software is protected by copyright and other intellectual property laws. GitDeep retains all title, interest, and ownership rights in the Software."
                }
            ]
        },
        privacy: {
            title: "Privacy Policy",
            lastUpdated: "July 8, 2026",
            sections: [
                {
                    heading: "1. Information Collection",
                    body: "We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us."
                },
                {
                    heading: "2. Use of Information",
                    body: "We may use the information we collect to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support, and authenticate users."
                },
                {
                    heading: "3. Sharing of Information",
                    body: "We do not share your personal information with third parties except as described in this privacy policy, such as with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf."
                }
            ]
        },
        cookies: {
            title: "Cookie Policy",
            lastUpdated: "July 8, 2026",
            sections: [
                {
                    heading: "1. What are Cookies?",
                    body: "Cookies are small text files stored on your device by a web browser. They are used to remember your preferences and keep track of your visits to our website."
                },
                {
                    heading: "2. How We Use Cookies",
                    body: "We use cookies to analyze web traffic, personalize content, and improve our services. Essential cookies are required for the website to function properly, while analytics cookies help us understand how you interact with our site."
                },
                {
                    heading: "3. Managing Cookies",
                    body: "You can control and manage cookies through your browser settings. However, disabling cookies may limit your ability to use certain features on our website."
                }
            ]
        },
        security: {
            title: "Security Policy",
            lastUpdated: "July 8, 2026",
            sections: [
                {
                    heading: "1. Data Protection",
                    body: "We implement robust security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. This includes encryption, firewalls, and secure server environments."
                },
                {
                    heading: "2. Vulnerability Reporting",
                    body: "If you believe you have found a security vulnerability in our systems, please report it to us immediately. We take all reports seriously and will investigate them promptly."
                },
                {
                    heading: "3. Compliance",
                    body: "We adhere strictly to industry standards and regulations regarding data security and privacy. Regular audits are conducted to ensure our security practices remain up to date."
                }
            ]
        }
    },
    tr: {
        licence: {
            title: "Lisans Sözleşmesi",
            lastUpdated: "8 Temmuz 2026",
            sections: [
                {
                    heading: "1. Lisansın Verilmesi",
                    body: "Bu Sözleşmenin şartlarına tabi olarak, GitDeep size Yazılımı kullanmanız için sınırlı, münhasır olmayan, devredilemez bir lisans verir."
                },
                {
                    heading: "2. Kısıtlamalar",
                    body: "Yazılıma tersine mühendislik yapamaz, kaynak koda dönüştüremez, parçalara ayıramaz veya Yazılımın teknik kısıtlamalarını aşamazsınız. Ayrıca Yazılımı satamaz, kiralayamaz veya alt lisansını veremezsiniz."
                },
                {
                    heading: "3. Fikri Mülkiyet",
                    body: "Yazılım telif hakkı ve diğer fikri mülkiyet yasaları ile korunmaktadır. GitDeep, Yazılım üzerindeki tüm mülkiyet, fayda ve hakları elinde tutar."
                }
            ]
        },
        privacy: {
            title: "Gizlilik Politikası",
            lastUpdated: "8 Temmuz 2026",
            sections: [
                {
                    heading: "1. Bilgi Toplama",
                    body: "Hesap oluşturduğunuzda veya değiştirdiğinizde, destek talep ettiğinizde veya bizimle doğrudan iletişim kurduğunuzda bize sağladığınız bilgileri topluyoruz."
                },
                {
                    heading: "2. Bilgilerin Kullanımı",
                    body: "Topladığımız bilgileri, talep ettiğiniz ürün ve hizmetleri sağlamak, yeni özellikler geliştirmek, müşteri desteği sunmak ve kullanıcıların kimliğini doğrulamak dâhil olmak üzere hizmetlerimizi sürdürmek ve iyileştirmek için kullanabiliriz."
                },
                {
                    heading: "3. Bilgilerin Paylaşımı",
                    body: "Kişisel bilgilerinizi, bizim adımıza çalışmaları yürütmek için bu bilgilere erişmesi gereken hizmet sağlayıcıları haricinde, bu gizlilik politikasında açıklanan durumlar dışında üçüncü taraflarla paylaşmayız."
                }
            ]
        },
        cookies: {
            title: "Çerez (Cookie) Politikası",
            lastUpdated: "8 Temmuz 2026",
            sections: [
                {
                    heading: "1. Çerezler Nedir?",
                    body: "Çerezler, bir web tarayıcısı tarafından cihazınızda saklanan küçük metin dosyalarıdır. Tercihlerinizi hatırlamak ve web sitemize yaptığınız ziyaretleri takip etmek için kullanılırlar."
                },
                {
                    heading: "2. Çerezleri Nasıl Kullanıyoruz",
                    body: "Çerezleri web trafiğini analiz etmek, içeriği kişiselleştirmek ve hizmetlerimizi iyileştirmek için kullanırız. Gerekli çerezler web sitesinin düzgün çalışması için zorunludur, analitik çerezler ise sitemizle nasıl etkileşime girdiğinizi anlamamıza yardımcı olur."
                },
                {
                    heading: "3. Çerezleri Yönetme",
                    body: "Tarayıcı ayarlarınız aracılığıyla çerezleri kontrol edebilir ve yönetebilirsiniz. Ancak, çerezleri devre dışı bırakmak web sitemizdeki bazı özellikleri kullanma yeteneğinizi sınırlayabilir."
                }
            ]
        },
        security: {
            title: "Güvenlik Politikası",
            lastUpdated: "8 Temmuz 2026",
            sections: [
                {
                    heading: "1. Veri Koruma",
                    body: "Verilerinizi yetkisiz erişime, değiştirilmeye, ifşa edilmeye veya yok edilmeye karşı korumak için sağlam güvenlik önlemleri uyguluyoruz. Buna şifreleme, güvenlik duvarları ve güvenli sunucu ortamları dâhildir."
                },
                {
                    heading: "2. Güvenlik Açığı Bildirimi",
                    body: "Sistemlerimizde bir güvenlik açığı bulduğunuza inanıyorsanız, lütfen derhal bize bildirin. Tüm raporları ciddiye alıyor ve derhal inceliyoruz."
                },
                {
                    heading: "3. Uyumluluk",
                    body: "Veri güvenliği ve gizliliğine ilişkin sektör standartlarına ve düzenlemelerine sıkı sıkıya bağlıyız. Güvenlik uygulamalarımızın güncel kalmasını sağlamak için düzenli denetimler yapılmaktadır."
                }
            ]
        }
    }
};
