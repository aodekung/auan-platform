import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Flame } from "lucide-react"
import { useLogin } from "@/hooks/use-auth"
import { useStoreSettings } from "@/hooks/use-settings"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน")
    .min(8, "รหัสผ่านอย่างน้อย 8 ตัวอักษร"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const login = useLogin()
  const { data: storeInfo } = useStoreSettings()

  // Extract store branding
  const storeName = storeInfo?.name || "Auan-Auan"
  const logoUrl = storeInfo?.logo
    ? `${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/uploads/${storeInfo.logo}`
    : ""

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(data: LoginFormData) {
    login.mutate(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={storeName}
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <Flame className="h-12 w-12 text-primary" />
          )}
          <h1 className="text-2xl font-bold text-foreground">{storeName} Admin</h1>
          <p className="text-sm text-muted-foreground">เข้าสู่ระบบเพื่อจัดการร้าน</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="อีเมล"
            type="email"
            placeholder="admin@auan-auan.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="รหัสผ่าน"
            type="password"
            placeholder="Ex.12345678"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {login.isError && (
            <p className="text-sm text-destructive">{login.error?.message}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={login.isPending}
          >
            เข้าสู่ระบบ
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {storeName} — Admin Dashboard
        </p>
      </div>
    </div>
  )
}
