type Props = { role: "SUPER_ADMIN" | "ADMIN" | "OPERATOR" | string };

export default function RoleBadge({ role }: Props) {
  if (role === "SUPER_ADMIN") {
    return <span className="admin-role-badge admin-role-badge--super">Супер Админ</span>;
  }
  if (role === "ADMIN") {
    return <span className="admin-role-badge admin-role-badge--admin">Админ</span>;
  }
  return <span className="admin-role-badge admin-role-badge--operator">Оператор</span>;
}
