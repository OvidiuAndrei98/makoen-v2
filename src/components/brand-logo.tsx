import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({
  href = "/",
  priority = false,
  light = false,
}: {
  href?: string;
  priority?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      className="wordmark brand-mark"
      href={href}
      aria-label="Makeon, acasă"
    >
      <span className="brand-horizontal">
        <Image
          src={light ? "/images/makeon-horizontal-logo-light.webp" : "/images/makeon-horizontal-logo.webp"}
          alt=""
          width={240}
          height={80}
          priority={priority}
          draggable={false}
        />
      </span>
    </Link>
  );
}
