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
            title: "End User License Agreement (EULA)",
            lastUpdated: "July 10, 2026",
            sections: [
                {
                    heading: "1. Agreement to Terms",
                    body: "By accessing or using GitDeep, you agree to be bound by this License Agreement. This is a legally binding contract between you (the end user) and GitDeep Inc. If you do not agree with these terms, you must immediately cease all use of the platform and services."
                },
                {
                    heading: "2. Grant of License",
                    body: "Subject to your compliance with this Agreement and payment of any applicable fees, GitDeep grants you a limited, revocable, non-exclusive, non-transferable license to access and use the Software solely for your internal business or personal use. This license does not grant you any rights to the underlying source code of the proprietary components of the platform."
                },
                {
                    heading: "3. Restrictions on Use",
                    body: "You shall not: (a) reverse engineer, decompile, or disassemble the Software; (b) modify, translate, or create derivative works based on the Software; (c) rent, lease, lend, sell, or sublicense the Software; (d) remove any proprietary notices or labels on the Software; or (e) use the Software for any illegal purpose or to violate the rights of others."
                },
                {
                    heading: "4. Intellectual Property Rights",
                    body: "All rights, title, and interest in and to the Software, including any updates, enhancements, and documentation, are and will remain the exclusive property of GitDeep Inc. and its licensors. The Software is protected by copyright, trademark, and other intellectual property laws."
                },
                {
                    heading: "5. Termination",
                    body: "This license is effective until terminated. GitDeep may terminate your license immediately without notice if you fail to comply with any term or condition of this Agreement. Upon termination, you must destroy all copies of the Software and cease all access to the platform."
                },
                {
                    heading: "6. Limitation of Liability",
                    body: "In no event shall GitDeep Inc. be liable for any special, incidental, indirect, or consequential damages whatsoever arising out of the use of or inability to use the Software, even if GitDeep has been advised of the possibility of such damages. Our total liability to you for all damages shall not exceed the amount paid by you for the software in the 12 months preceding the claim."
                }
            ]
        },
        privacy: {
            title: "Privacy Policy",
            lastUpdated: "July 10, 2026",
            sections: [
                {
                    heading: "1. Information We Collect",
                    body: "We collect information you provide directly to us when you register for an account, subscribe to our services, or contact customer support. This includes your name, email address, billing information, and any repository data you authorize us to analyze via GitHub, GitLab, or Bitbucket integrations."
                },
                {
                    heading: "2. Automated Data Collection",
                    body: "When you interact with our platform, we automatically collect certain information about your device and usage patterns. This includes your IP address, browser type, operating system, referring URLs, and telemetry data regarding how you use our analysis tools. We use this data to ensure platform stability and prevent abuse."
                },
                {
                    heading: "3. How We Use Your Data",
                    body: "Your information is used to: (a) provide, operate, and maintain our services; (b) process and complete transactions; (c) analyze repository health and generate insights as per your request; (d) send you technical notices, updates, and administrative messages; and (e) respond to your comments, questions, and customer service requests."
                },
                {
                    heading: "4. Data Processing with AI",
                    body: "GitDeep utilizes advanced AI models (such as Claude) to analyze your code. When your repositories are scanned, snippets of your code may be securely transmitted to our AI partners' APIs. We maintain strict Data Processing Agreements (DPAs) with these partners to ensure your code is never used to train public models without your explicit consent."
                },
                {
                    heading: "5. Data Retention and Deletion",
                    body: "We retain your personal information and repository analysis data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy. If you delete your account, we will permanently delete all associated data within 30 days, except where retention is required by law."
                },
                {
                    heading: "6. Your Privacy Rights",
                    body: "Depending on your location, you may have the right to access, correct, update, or request deletion of your personal information (e.g., GDPR, CCPA). You can exercise these rights by contacting us at privacy@gitdeep.dev. We will respond to all requests in accordance with applicable data protection laws."
                }
            ]
        },
        cookies: {
            title: "Cookie Policy",
            lastUpdated: "July 10, 2026",
            sections: [
                {
                    heading: "1. Understanding Cookies",
                    body: "Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently, as well as to provide reporting information and personalized experiences."
                },
                {
                    heading: "2. Essential Cookies",
                    body: "These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as accessing secure areas that require login. Without these cookies, the core functionality of GitDeep cannot be provided."
                },
                {
                    heading: "3. Performance & Analytics Cookies",
                    body: "We use performance and analytics cookies to collect information about how visitors interact with our platform. This includes tracking page visits, time spent on pages, and identifying any errors that occur. We use third-party services like Google Analytics to help us analyze this data in an aggregated, anonymous format."
                },
                {
                    heading: "4. Functionality & Preference Cookies",
                    body: "These cookies allow our website to remember choices you make when you use the platform, such as remembering your language preferences, theme settings (dark/light mode), and other customizable elements. The purpose of these cookies is to provide you with a more personal experience."
                },
                {
                    heading: "5. How to Control Cookies",
                    body: "You have the right to decide whether to accept or reject non-essential cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Banner that appears when you first visit our site. Alternatively, you can configure your web browser controls to accept or refuse cookies."
                }
            ]
        },
        security: {
            title: "Security & Compliance Policy",
            lastUpdated: "July 10, 2026",
            sections: [
                {
                    heading: "1. Infrastructure Security",
                    body: "GitDeep's infrastructure is hosted on industry-leading cloud providers (AWS, Cloudflare) with robust physical and network security. All data is stored in highly secure data centers that comply with ISO 27001 and SOC 2 Type II standards. We utilize Virtual Private Clouds (VPCs) to isolate our internal services."
                },
                {
                    heading: "2. Data Encryption",
                    body: "We employ state-of-the-art encryption protocols to protect your data. All data transmitted between your browser and our servers is encrypted in transit using TLS 1.3. Additionally, all sensitive data, including API keys, tokens, and database records, are encrypted at rest using AES-256 encryption."
                },
                {
                    heading: "3. Access Control & Authentication",
                    body: "Access to production systems is strictly limited to authorized personnel based on the principle of least privilege. We enforce Multi-Factor Authentication (MFA) for all employee access. Customer authentication is handled via secure, modern protocols with support for SSO, OAuth, and hardware security keys."
                },
                {
                    heading: "4. Code Security & Analysis",
                    body: "Your source code is our highest priority. When GitDeep analyzes your repository, the code is temporarily processed in isolated, ephemeral sandboxes. Once the analysis pipeline is complete and the health score is generated, the local copy of the code is securely wiped from the sandbox environment."
                },
                {
                    heading: "5. Vulnerability Management",
                    body: "We continuously scan our own infrastructure and application code for vulnerabilities using automated SAST and DAST tools. We also maintain a responsible disclosure program. If you discover a security flaw, please report it to security@gitdeep.dev. We are committed to resolving critical vulnerabilities within 24 hours."
                }
            ]
        }
    },
    tr: {
        licence: {
            title: "Son Kullanıcı Lisans Sözleşmesi (EULA)",
            lastUpdated: "10 Temmuz 2026",
            sections: [
                {
                    heading: "1. Şartların Kabulü",
                    body: "GitDeep platformuna erişerek veya kullanarak, bu Lisans Sözleşmesine bağlı kalmayı kabul etmiş olursunuz. Bu, sizinle (son kullanıcı) GitDeep Inc. arasında yasal olarak bağlayıcı bir sözleşmedir. Bu şartları kabul etmiyorsanız, platformun ve hizmetlerin tüm kullanımını derhal durdurmalısınız."
                },
                {
                    heading: "2. Lisansın Verilmesi",
                    body: "Bu Sözleşmeye uymanız ve geçerli ücretleri ödemeniz şartıyla, GitDeep size Yazılımı yalnızca dahili işiniz veya kişisel kullanımınız için erişmeniz ve kullanmanız amacıyla sınırlı, geri alınabilir, münhasır olmayan, devredilemez bir lisans verir. Bu lisans, platformun tescilli bileşenlerinin temel kaynak koduna ilişkin size hiçbir hak vermez."
                },
                {
                    heading: "3. Kullanım Kısıtlamaları",
                    body: "Şunları yapamazsınız: (a) Yazılıma tersine mühendislik yapmak, kaynak koda dönüştürmek veya parçalara ayırmak; (b) Yazılımı değiştirmek, çevirmek veya temel alan türev çalışmalar oluşturmak; (c) Yazılımı kiralamak, satmak veya alt lisansını vermek; (d) Yazılım üzerindeki tescilli bildirimleri kaldırmak; (e) Yazılımı yasa dışı bir amaç veya başkalarının haklarını ihlal etmek için kullanmak."
                },
                {
                    heading: "4. Fikri Mülkiyet Hakları",
                    body: "Güncellemeler, geliştirmeler ve belgeler dahil olmak üzere Yazılımdaki tüm haklar, unvanlar ve menfaatler GitDeep Inc. ve lisans verenlerinin münhasır mülkiyetindedir ve öyle kalacaktır. Yazılım, telif hakkı, ticari marka ve diğer fikri mülkiyet yasalarıyla korunmaktadır."
                },
                {
                    heading: "5. Fesih",
                    body: "Bu lisans feshedilene kadar geçerlidir. Bu Sözleşmenin herhangi bir şartına veya koşuluna uymazsanız, GitDeep lisansınızı önceden bildirmeksizin derhal feshedebilir. Fesih üzerine, Yazılımın tüm kopyalarını imha etmeli ve platforma tüm erişiminizi durdurmalısınız."
                },
                {
                    heading: "6. Sorumluluğun Sınırlandırılması",
                    body: "GitDeep Inc., Yazılımın kullanımından veya kullanılamamasından kaynaklanan herhangi bir özel, arızi, dolaylı veya sonuç niteliğindeki zarardan, bu tür zararların olasılığı kendisine bildirilmiş olsa dahi hiçbir durumda sorumlu tutulamaz. Tüm hasarlar için size karşı toplam sorumluluğumuz, talepten önceki 12 ay içinde yazılım için ödediğiniz tutarı aşmayacaktır."
                }
            ]
        },
        privacy: {
            title: "Gizlilik Politikası",
            lastUpdated: "10 Temmuz 2026",
            sections: [
                {
                    heading: "1. Topladığımız Bilgiler",
                    body: "Bir hesap oluşturduğunuzda, hizmetlerimize abone olduğunuzda veya müşteri desteğiyle iletişime geçtiğinizde doğrudan bize sağladığınız bilgileri topluyoruz. Buna adınız, e-posta adresiniz, fatura bilgileriniz ve GitHub, GitLab veya Bitbucket entegrasyonları aracılığıyla analiz etmemize izin verdiğiniz tüm depo (repository) verileri dahildir."
                },
                {
                    heading: "2. Otomatik Veri Toplama",
                    body: "Platformumuzla etkileşime girdiğinizde, cihazınız ve kullanım kalıplarınız hakkında belirli bilgileri otomatik olarak toplarız. Buna IP adresiniz, tarayıcı tipiniz, işletim sisteminiz, yönlendiren URL'ler ve analiz araçlarımızı nasıl kullandığınıza ilişkin telemetri verileri dahildir. Bu verileri platform kararlılığını sağlamak ve kötüye kullanımı önlemek için kullanıyoruz."
                },
                {
                    heading: "3. Verilerinizi Nasıl Kullanıyoruz",
                    body: "Bilgileriniz şunlar için kullanılır: (a) hizmetlerimizi sağlamak, işletmek ve sürdürmek; (b) işlemleri tamamlamak; (c) depo sağlığını analiz etmek ve talebiniz doğrultusunda içgörüler oluşturmak; (d) size teknik bildirimler, güncellemeler ve idari mesajlar göndermek; ve (e) yorumlarınıza, sorularınıza ve müşteri hizmetleri taleplerinize yanıt vermek."
                },
                {
                    heading: "4. Yapay Zeka ile Veri İşleme",
                    body: "GitDeep, kodunuzu analiz etmek için gelişmiş yapay zeka modellerini (örn. Claude) kullanır. Depolarınız tarandığında, kodunuzun parçacıkları güvenli bir şekilde yapay zeka iş ortaklarımızın API'lerine iletilebilir. Kodunuzun sizin açık rızanız olmadan kamuya açık modelleri eğitmek için asla kullanılmamasını sağlamak adına bu iş ortaklarıyla sıkı Veri İşleme Anlaşmaları (DPA) yürütüyoruz."
                },
                {
                    heading: "5. Veri Saklama ve Silme",
                    body: "Kişisel bilgilerinizi ve depo analiz verilerinizi yalnızca bu Gizlilik Politikasında belirtilen amaçları yerine getirmek için gerekli olduğu sürece saklarız. Hesabınızı silerseniz, yasalarca saklanması gereken durumlar haricinde, ilişkili tüm verileri 30 gün içinde kalıcı olarak sileceğiz."
                },
                {
                    heading: "6. Gizlilik Haklarınız",
                    body: "Bulunduğunuz yere bağlı olarak (örn. KVKK, GDPR), kişisel bilgilerinize erişme, bunları düzeltme, güncelleme veya silinmesini talep etme hakkına sahip olabilirsiniz. Bu haklarınızı privacy@gitdeep.dev adresinden bizimle iletişime geçerek kullanabilirsiniz. Tüm taleplere geçerli veri koruma yasalarına uygun olarak yanıt vereceğiz."
                }
            ]
        },
        cookies: {
            title: "Çerez (Cookie) Politikası",
            lastUpdated: "10 Temmuz 2026",
            sections: [
                {
                    heading: "1. Çerezleri Anlamak",
                    body: "Çerezler, web sitemizi ziyaret ettiğinizde bilgisayarınıza veya mobil cihazınıza yerleştirilen küçük metin dosyalarıdır. Web sitelerinin daha verimli çalışmasını sağlamak, raporlama bilgileri ve kişiselleştirilmiş deneyimler sunmak için yaygın olarak kullanılırlar."
                },
                {
                    heading: "2. Gerekli (Zorunlu) Çerezler",
                    body: "Bu çerezler, web sitemiz aracılığıyla sunulan hizmetleri size sağlamak ve oturum açma gerektiren güvenli alanlara erişim gibi bazı özelliklerini kullanabilmeniz için kesinlikle gereklidir. Bu çerezler olmadan GitDeep'in temel işlevleri sunulamaz."
                },
                {
                    heading: "3. Performans ve Analitik Çerezleri",
                    body: "Ziyaretçilerin platformumuzla nasıl etkileşime girdiğine dair bilgi toplamak için performans ve analitik çerezleri kullanıyoruz. Buna sayfa ziyaretlerini, sayfalarda geçirilen süreyi izlemek ve oluşan hataları belirlemek dahildir. Bu verileri toplu ve anonim bir biçimde analiz etmemize yardımcı olması için Google Analytics gibi üçüncü taraf hizmetleri kullanıyoruz."
                },
                {
                    heading: "4. İşlevsellik ve Tercih Çerezleri",
                    body: "Bu çerezler, dil tercihlerinizi, tema ayarlarınızı (koyu/açık mod) ve diğer özelleştirilebilir unsurları hatırlamak gibi, platformu kullandığınızda yaptığınız seçimleri web sitemizin hatırlamasını sağlar. Bu çerezlerin amacı size daha kişisel bir deneyim sunmaktır."
                },
                {
                    heading: "5. Çerezleri Nasıl Kontrol Edebilirsiniz",
                    body: "Zorunlu olmayan çerezleri kabul edip etmemeye karar verme hakkına sahipsiniz. Sitemizi ilk ziyaret ettiğinizde görünen Çerez İzni Afişinde tercihlerinizi ayarlayarak çerez haklarınızı kullanabilirsiniz. Alternatif olarak, web tarayıcınızın kontrollerini çerezleri kabul edecek veya reddedecek şekilde yapılandırabilirsiniz."
                }
            ]
        },
        security: {
            title: "Güvenlik ve Uyumluluk Politikası",
            lastUpdated: "10 Temmuz 2026",
            sections: [
                {
                    heading: "1. Altyapı Güvenliği",
                    body: "GitDeep'in altyapısı, sağlam fiziksel ve ağ güvenliği ile sektör lideri bulut sağlayıcılarında (AWS, Cloudflare) barındırılmaktadır. Tüm veriler ISO 27001 ve SOC 2 Type II standartlarına uygun son derece güvenli veri merkezlerinde saklanır. İç hizmetlerimizi izole etmek için Sanal Özel Ağlar (VPC) kullanıyoruz."
                },
                {
                    heading: "2. Veri Şifreleme",
                    body: "Verilerinizi korumak için en son teknoloji ürünü şifreleme protokollerini kullanıyoruz. Tarayıcınız ile sunucularımız arasında iletilen tüm veriler TLS 1.3 kullanılarak aktarım sırasında şifrelenir. Ayrıca, API anahtarları, belirteçler (token) ve veritabanı kayıtları dahil tüm hassas veriler AES-256 şifrelemesi kullanılarak beklerken şifrelenir."
                },
                {
                    heading: "3. Erişim Kontrolü ve Kimlik Doğrulama",
                    body: "Üretim sistemlerine erişim, en az ayrıcalık (least privilege) ilkesine dayalı olarak yalnızca yetkili personelle kesinlikle sınırlandırılmıştır. Tüm çalışan erişimleri için Çok Faktörlü Kimlik Doğrulamayı (MFA) zorunlu kılıyoruz. Müşteri kimlik doğrulaması, SSO, OAuth ve donanım güvenlik anahtarı destekli güvenli, modern protokoller üzerinden gerçekleştirilir."
                },
                {
                    heading: "4. Kod Güvenliği ve Analizi",
                    body: "Kaynak kodunuz en yüksek önceliğimizdir. GitDeep deponuzu analiz ettiğinde, kod geçici olarak izole edilmiş, geçici sanal alanlarda (sandbox) işlenir. Analiz süreci tamamlandığında ve sağlık skoru oluşturulduğunda, kodun yerel kopyası korumalı alan ortamından güvenli bir şekilde tamamen silinir."
                },
                {
                    heading: "5. Güvenlik Açığı Yönetimi",
                    body: "Kendi altyapımızı ve uygulama kodumuzu otomatik SAST ve DAST araçlarını kullanarak güvenlik açıklarına karşı sürekli tarıyoruz. Ayrıca sorumlu bir ifşa programı yürütüyoruz. Bir güvenlik açığı keşfederseniz, lütfen security@gitdeep.dev adresine bildirin. Kritik güvenlik açıklarını 24 saat içinde çözmeyi taahhüt ediyoruz."
                }
            ]
        }
    }
};
