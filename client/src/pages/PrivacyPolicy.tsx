import { SEO } from "@/components/SEO";
import { SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/lib/constants";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title={`Privacy Policy - ${SITE_NAME}`} 
        description={`Privacy Policy for ${SITE_NAME}. Learn how we collect, use, and protect your information.`} 
      />
      
      <h1 className="text-3xl font-bold text-foreground mb-8" data-testid="text-page-title">
        Privacy Policy
      </h1>
      
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Introduction</h2>
          <p>
            At {SITE_NAME}, we respect your privacy and are committed to protecting any information that may be collected while you use our website. This Privacy Policy explains our practices regarding data collection, use, and disclosure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
          <p>
            Our tools are designed to run entirely in your browser (client-side). This means that any text, images, or data you input into our tools is processed locally on your device and is <strong>not uploaded or stored on our servers</strong>. Your data stays with you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Log Files</h2>
          <p>
            Like many websites, {SITE_NAME} uses standard log files. The information collected in log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), referring/exit pages, date/time stamps, and number of clicks. This information is used to analyze trends, administer the site, track user movement around the site, and gather demographic information. IP addresses and other such information are not linked to any personally identifiable information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Cookies and Web Beacons</h2>
          <p>
            {SITE_NAME} uses cookies to store information about visitor preferences, to record user-specific information on which pages the site visitor accesses or visits, and to personalize or customize our web page content based upon visitors' browser type or other information that the visitor sends via their browser.
          </p>
          <h3 className="text-lg font-medium text-foreground">Third-Party Advertising Cookies</h3>
          <p>
            Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to {SITE_NAME} and/or other sites on the Internet.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ads Settings</a>. Alternatively, users can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aboutads.info</a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Google Analytics</h2>
          <p>
            We may use Google Analytics to help analyze how users use the site. Google Analytics uses cookies to collect information such as how often users visit the site, what pages they visit, and what other sites they used prior to coming to this site. We use the information we get from Google Analytics only to improve this site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Children's Privacy</h2>
          <p>
            {SITE_NAME} does not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us so that we can take necessary actions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Your Rights (GDPR)</h2>
          <p>
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights. You have the right to access, update, or delete your personal information, the right to restrict processing, and the right to data portability. Since our tools do not store your data on our servers, most of these rights are automatically satisfied.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
