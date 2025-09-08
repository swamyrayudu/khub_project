import AdminHeader from "@/components/layouts/AdminHeader";



export default function AdminLayout({ children } : {children: React.ReactNode}) {
  return (
    <>
      <AdminHeader />
      {children}
    </>
  )
}
