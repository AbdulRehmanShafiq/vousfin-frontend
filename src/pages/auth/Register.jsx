import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { passwordZodRule, PASSWORD_HINT } from '@/utils/passwordRules'
import { getErrorMessage } from '@/utils/errorHandler'
import { Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: passwordZodRule(),
})

export default function Register() {
  const navigate = useNavigate()
  const registerUser = useAuthStore((s) => s.register)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Account created successfully')
      navigate('/business/setup', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-text-primary tracking-tight">Create Account</h1>
        <p className="mt-2 text-text-secondary">Join vousFin and automate your accounting</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full Name"
          icon={User}
          placeholder="John Doe"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Work Email"
          type="email"
          icon={Mail}
          placeholder="john@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="e.g. Uzair123@"
          error={errors.password?.message}
          {...register('password')}
        />
        <p className="-mt-3 text-xs text-text-muted">{PASSWORD_HINT}</p>

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-4">
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-cyan hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  )
}
