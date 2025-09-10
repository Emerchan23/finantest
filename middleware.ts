import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura-aqui'

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/api/auth/login']

// Rotas da API que precisam de autenticação
const protectedApiRoutes = ['/api/usuarios', '/api/auth/verify', '/api/auth/logout']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acesso a arquivos estáticos
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/icons/')
  ) {
    return NextResponse.next()
  }

  // Verificar se é uma rota pública
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Verificar se é uma rota da API protegida
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedApiRoute) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    try {
      jwt.verify(token, JWT_SECRET)
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
  }

  // Para rotas da aplicação (não API), verificar se tem token no cookie ou header
  if (!pathname.startsWith('/api/')) {
    // Verificar token no cookie ou localStorage (será verificado no cliente)
    // Por enquanto, permitir acesso e deixar o AuthContext lidar com a autenticação
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}