import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

export default function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site world-coffee shop-site">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </div>
  );
}
