import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMAIL API DEBUG START ===')
    const body = await request.json()
    const { to, subject, html, attachments } = body
    console.log('Request body:', { to, subject, htmlLength: html?.length, attachments })

    if (!to || !subject || !html) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Campos obrigatórios: to, subject, html' },
        { status: 400 }
      )
    }

    // Obter configurações SMTP da empresa atual (server-side implementation)
    console.log('Getting current empresa...')
    
    // Get user preferences to find current empresa ID
    const userPrefsRow = await db.prepare('SELECT * FROM user_prefs WHERE userId = ?').get('default') as any
    const userPrefs = userPrefsRow ? JSON.parse(userPrefsRow.json) : null
    const empresaId = userPrefs?.currentEmpresaId
    
    if (!empresaId) {
      console.error('No current empresa ID found in user preferences')
      return NextResponse.json({ error: 'No current empresa configured' }, { status: 400 })
    }
    
    // Get empresa data
    const currentEmpresa = await db.prepare('SELECT * FROM empresas WHERE id = ?').get(empresaId)
    if (!currentEmpresa) {
      console.error('Empresa not found:', empresaId)
      return NextResponse.json({ error: 'Empresa not found' }, { status: 404 })
    }
    
    console.log('Current empresa:', currentEmpresa)

    // Get SMTP config from empresa (already loaded)
    console.log('Getting SMTP config from empresa...');
    console.log('SMTP config:', {
      smtp_host: (currentEmpresa as any).smtp_host,
      smtp_port: (currentEmpresa as any).smtp_port,
      smtp_secure: (currentEmpresa as any).smtp_secure,
      smtp_user: (currentEmpresa as any).smtp_user,
      smtp_password: (currentEmpresa as any).smtp_password ? '[HIDDEN]' : null,
      smtp_from_name: (currentEmpresa as any).smtp_from_name,
      smtp_from_email: (currentEmpresa as any).smtp_from_email
    });
    
    const smtpHost = (currentEmpresa as any).smtp_host
    const smtpPort = (currentEmpresa as any).smtp_port
    const smtpSecure = (currentEmpresa as any).smtp_secure
    const smtpUser = (currentEmpresa as any).smtp_user
    const smtpPassword = (currentEmpresa as any).smtp_password
    const smtpFromName = (currentEmpresa as any).smtp_from_name
    const smtpFromEmail = (currentEmpresa as any).smtp_from_email

    console.log('SMTP Config values:', { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword: smtpPassword ? '[HIDDEN]' : 'null', smtpFromName, smtpFromEmail })
    
    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.log('SMTP config incomplete')
      return NextResponse.json(
        { error: 'Configurações SMTP incompletas. Configure nas Configurações Gerais.' },
        { status: 400 }
      )
    }

    // Criar transporter do nodemailer
    console.log('Creating nodemailer transporter...')
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort || 587,
      secure: smtpSecure || false,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    })
    console.log('Transporter created successfully')

    // Configurar opções do e-mail
    const mailOptions = {
      from: `"${smtpFromName || (currentEmpresa as any).nome}" <${smtpFromEmail || smtpUser}>`,
      to,
      subject,
      html,
      attachments: attachments || []
    }
    console.log('Mail options:', { ...mailOptions, html: '[HTML_CONTENT]' })

    // Enviar e-mail
    console.log('Sending email...')
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)

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