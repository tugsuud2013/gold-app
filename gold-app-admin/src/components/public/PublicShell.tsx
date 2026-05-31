import { PropsWithChildren } from "react";

/** @deprecated Use (public) layout instead. Renders children only to avoid duplicate header/footer. */
export default function PublicShell({ children }: PropsWithChildren) {
  return <>{children}</>;
}
