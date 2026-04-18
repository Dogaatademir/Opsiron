import React from 'react';
import SEO from '../components/common/SEO';
import { PAGE_SEO, SITE_META, CONTACT_INFO } from '../constants/content';

export default function Terms() {
  return (
    <>
      <SEO
        title={PAGE_SEO.terms.title}
        description={PAGE_SEO.terms.description}
        keywords={PAGE_SEO.terms.keywords}
      />

      {/* Header */}
      <header className="pt-[calc(theme(spacing.header)+4rem)] pb-12 border-b border-border-gray bg-page">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-5xl font-light tracking-tighter mb-4 text-dark">
            Kullanım Koşulları
          </h1>
          <p className="text-muted font-light">
            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg text-muted font-light leading-relaxed">

            <p className="mb-8 text-lg">
              Lütfen {SITE_META.siteName} ("Web Sitesi") kullanmadan önce bu Kullanım Koşullarını dikkatlice
              okuyunuz. Siteye erişerek veya siteyi kullanarak bu koşulları kabul etmiş sayılırsınız.
            </p>

            <h2 className="text-2xl font-medium text-dark mt-12 mb-6 tracking-tight">1. Hizmetin Kapsamı</h2>
            <p className="mb-8">
              {SITE_META.siteName}, markalara özel web sitesi tasarımı ve geliştirme hizmeti sunan butik bir
              web design stüdyosudur. Web sitemizdeki içerikler genel bilgilendirme amaçlıdır. Hizmetlerimize
              ilişkin detaylar ve koşullar, her proje için ayrıca düzenlenen hizmet sözleşmesinde belirlenir.
            </p>

            <h2 className="text-2xl font-medium text-dark mt-12 mb-6 tracking-tight">2. Fikri Mülkiyet</h2>
            <p className="mb-8">
              Bu sitede yer alan tüm metinler, görseller, tasarımlar, logolar ve yazılımlar {SITE_META.siteName}'a
              aittir ve fikri mülkiyet kanunları ile korunmaktadır. İzinsiz kopyalanması, çoğaltılması veya
              dağıtılması yasaktır.
            </p>
            <p className="mb-8">
              Müşterilere teslim edilen projeler kapsamındaki fikri mülkiyet hakları, taraflar arasında imzalanan
              hizmet sözleşmesinde ayrıca düzenlenir. Teslim öncesi tasarım ve geliştirme çıktılarının tüm
              hakları {SITE_META.siteName}'a aittir.
            </p>

            <h2 className="text-2xl font-medium text-dark mt-12 mb-6 tracking-tight">3. Kullanıcı Sorumlulukları</h2>
            <p className="mb-4">Siteyi kullanırken şunları taahhüt edersiniz:</p>
            <ul className="list-disc pl-6 space-y-3 mb-8">
              <li>Siteyi yasalara aykırı amaçlar için kullanmamak.</li>
              <li>Sitenin güvenliğini veya işleyişini bozacak girişimlerde bulunmamak.</li>
              <li>Üçüncü şahısların haklarına zarar verecek içerik paylaşmamak.</li>
              <li>İletişim formunu gerçek ve doğru bilgilerle doldurmak.</li>
            </ul>

            <h2 className="text-2xl font-medium text-dark mt-12 mb-6 tracking-tight">4. Hizmet Süreci</h2>
            <p className="mb-8">
              {SITE_META.siteName} ile gerçekleştirilecek projeler, her müşteri için ayrıca hazırlanan kapsam
              belgesi ve hizmet sözleşmesine tabidir. Web sitesi üzerinden yapılan iletişim başvuruları,
              hizmet taahhüdü anlamına gelmez; yalnızca ilk görüşme talebini ifade eder.
            </p>

            <h2 className="text-2xl font-medium text-dark mt-12 mb-6 tracking-tight">5. Sorumluluk Reddi</h2>
            <p className="mb-8">
              Web sitesi ve içerikleri "olduğu gibi" sunulmaktadır. {SITE_META.siteName}, sitenin kesintisiz
              veya hatasız çalışacağını garanti etmez. Sitenin kullanımından doğabilecek doğrudan veya dolaylı
              zararlardan sorumlu tutulamaz.
            </p>

            <h2 className="text-2xl font-medium text-dark mt-12 mb-6 tracking-tight">6. Bağlantılı Siteler</h2>
            <p className="mb-8">
              Web sitemiz, portföy çalışmaları kapsamında üçüncü taraf sitelere bağlantılar içerebilir.
              Bu sitelerin içeriği ve gizlilik politikaları {SITE_META.siteName}'ın kontrolünde değildir;
              bu sitelerden kaynaklanan herhangi bir sorumluluk kabul edilmez.
            </p>

            <h2 className="text-2xl font-medium text-dark mt-12 mb-6 tracking-tight">7. Değişiklikler</h2>
            <p className="mb-8">
              {SITE_META.siteName}, bu kullanım koşullarını dilediği zaman değiştirme hakkını saklı tutar.
              Değişiklikler sitede yayınlandığı tarihte yürürlüğe girer.
            </p>

            <h2 className="text-2xl font-medium text-dark mt-12 mb-6 tracking-tight">8. İletişim</h2>
            <p className="mb-8">
              Bu koşullarla ilgili sorularınız için bizimle iletişime geçebilirsiniz.
            </p>

            <div className="bg-page p-6 border border-border-gray rounded-sm">
              <p className="mb-2"><strong className="text-dark">E-posta:</strong> {CONTACT_INFO.email}</p>
              <p className="mb-0"><strong className="text-dark">Adres:</strong> {CONTACT_INFO.address.full}</p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}