import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empresaId } = body

    if (!empresaId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar configurações SMTP diretamente do banco
    const empresa = db.prepare("SELECT * FROM empresas WHERE id = ?").get(empresaId) as any
    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Extrair configurações SMTP do banco
    const smtpHost = empresa.smtp_host
    const smtpPort = empresa.smtp_port || 587
    const smtpSecure = Boolean(empresa.smtp_secure)
    const smtpUser = empresa.smtp_user
    const smtpPassword = empresa.smtp_password
    const smtpFromName = empresa.smtp_from_name
    const smtpFromEmail = empresa.smtp_from_email

    // Validar configurações obrigatórias
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      return NextResponse.json(
        { 
          error: 'Configurações SMTP incompletas',
          details: 'Verifique se todos os campos obrigatórios estão preenchidos (Host, Porta, Usuário, Senha)'
        },
        { status: 400 }
      )
    }

    // Criar transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Boolean(smtpSecure), // true para 465, false para outras portas
      auth: {
        user: smtpUser,
        pass: smtpPassword
      },
      // Timeout para teste de conexão
      connectionTimeout: 10000, // 10 segundos
      greetingTimeout: 5000, // 5 segundos
      socketTimeout: 10000 // 10 segundos
    })

    // Testar conexão
    await transporter.verify()

    return NextResponse.json({
      success: true,
      message: 'Conexão SMTP testada com sucesso!',
      config: {
        host: smtpHost,
        port: smtpPort,
        secure: Boolean(smtpSecure),
        user: smtpUser,
        fromName: smtpFromName || empresa.nome,
        fromEmail: smtpFromEmail || smtpUser
      }
    })

  } catch (error) {
    console.error('Erro ao testar conexão SMTP:', error)
    
    let errorMessage = 'Erro desconhecido ao testar conexão SMTP'
    let errorDetails = ''

    if (error instanceof Error) {
      errorMessage = error.message
      
      // Mensagens de erro mais amigáveis
      if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Servidor SMTP não encontrado'
        errorDetails = 'Verifique se o host SMTP está correto'
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Conexão recusada pelo servidor'
        errorDetails = 'Verifique se a porta está correta e se o servidor está ativo'
      } else if (error.message.includes('Invalid login')) {
        errorMessage = 'Credenciais inválidas'
        errorDetails = 'Verifique se o usuário e senha estão corretos'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout na conexão'
        errorDetails = 'O servidor demorou muito para responder. Verifique a conexão de internet'
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        success: false
      },
      { status: 500 }
    )
  }
}