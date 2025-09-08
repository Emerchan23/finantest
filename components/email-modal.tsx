"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send } from "lucide-react"
import { makeOrcamentoHTML } from "@/lib/print"
import { ensureDefaultEmpresa } from "@/lib/empresas"

interface EmailModalProps {
  orcamento: any
  onEmailSent?: () => void
}

export function EmailModal({ orcamento, onEmailSent }: EmailModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    to: "",
    subject: `Orçamento #${orcamento.numero} - ${orcamento.cliente?.nome || 'Cliente'}`,
    message: `Prezado(a) ${orcamento.cliente?.nome || 'Cliente'},\n\nSegue em anexo o orçamento solicitado.\n\nAtenciosamente,\nEquipe de Vendas`
  })
  const { toast } = useToast()

  const handleSendEmail = async () => {
    if (!formData.to.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o e-mail do destinatário",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Garantir empresa atual definida
      await ensureDefaultEmpresa()
      
      // Gerar HTML do orçamento
      const withTotal = { ...orcamento, total: orcamento.itens?.reduce((acc: number, it: any) => 
        acc + (Number(it.quantidade) || 0) * (Number(it.valor_unitario) || 0) - (Number(it.desconto) || 0), 0) || 0 }
      const orcamentoHTML = await makeOrcamentoHTML(withTotal)
      
      // Criar HTML completo do e-mail
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0;">Orçamento #${orcamento.numero}</h2>
            <p style="color: #666; margin: 10px 0 0 0;">Cliente: ${orcamento.cliente?.nome || 'N/A'}</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; line-height: 1.6; white-space: pre-line;">${formData.message}</p>
          </div>
          
          <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
            ${orcamentoHTML}
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="color: #666; font-size: 12px; margin: 0;">Este e-mail foi enviado automaticamente pelo sistema de orçamentos.</p>
          </div>
        </div>
      `
      
      // Enviar e-mail via API
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          html: emailHTML
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar e-mail')
      }
      
      toast({
        title: "Sucesso",
        description: "E-mail enviado com sucesso!"
      })
      
      setOpen(false)
      onEmailSent?.()
      
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar e-mail",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Enviar por e-mail"
        >
          <Mail className="h-4 w-4" />
          <span className="sr-only">Enviar por e-mail</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Orçamento por E-mail</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email-to">Destinatário</Label>
            <Input
              id="email-to"
              type="email"
              placeholder="cliente@email.com"
              value={formData.to}
              onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email-subject">Assunto</Label>
            <Input
              id="email-subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email-message">Mensagem</Label>
            <Textarea
              id="email-message"
              rows={4}
              placeholder="Digite sua mensagem..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} disabled={loading}>
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar E-mail
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}