import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getCurrentEmpresa } from '@/lib/empresas'
import { api } from '@/lib/api-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, attachments } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: to, subject, html' },
        { status: 400 }
      )
    }

    // Obter configurações SMTP da empresa atual
    const currentEmpresa = await getCurrentEmpresa()
    if (!currentEmpresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    let empresaConfig: any = {}
    try {
      empresaConfig = await api.empresas.config.get(currentEmpresa.id)
    } catch (error) {
      return NextResponse.json(
        { error: 'Configurações SMTP não encontradas' },
        { status: 404 }
      )
    }

    const {
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPassword,
      smtpFromName,
      smtpFromEmail
    } = empresaConfig

    if (!smtpHost || !smtpUser || !smtpPassword) {
      return NextResponse.json(
        { error: 'Configurações SMTP incompletas. Configure nas Configurações Gerais.' },
        { status: 400 }
      )
    }

    // Criar transporter do nodemailer
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: smtpPort || 587,
      secure: smtpSecure || false,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    })

    // Configurar opções do e-mail
    const mailOptions = {
      from: `"${smtpFromName || currentEmpresa.nome}" <${smtpFromEmail || smtpUser}>`,
      to,
      subject,
      html,
      attachments: attachments || []
    }

    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'E-mail enviado com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao enviar e-mail',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}