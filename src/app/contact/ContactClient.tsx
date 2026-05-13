'use client';

import { useState } from 'react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Mail, MapPin, Phone, ShieldCheck, Truck } from 'lucide-react';

const supportSignals = [
  {
    icon: Truck,
    title: 'Dispatch',
    text: 'Quick answers for stock, order status, and wholesale availability.',
  },
  {
    icon: ShieldCheck,
    title: 'Trade support',
    text: 'Account and pricing questions handled as buyer-facing wholesale support.',
  },
  {
    icon: MapPin,
    title: 'Houston, Texas',
    text: 'Designed as a regional wholesaler with a local shipping and support footprint.',
  },
];

export function ContactClient() {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('contact_submissions').insert([data]);

    if (error) {
      toast.error('Failed to send message. Please try again.');
    } else {
      toast.success('Message sent successfully!');
      (e.target as HTMLFormElement).reset();
      setSubject('');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1 px-4 py-8 md:px-6 md:py-12">
        <div className="container space-y-8">
          <section className="shell-frame overflow-hidden">
            <div className="shell-core grid gap-8 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[0.96fr_1.04fr] lg:px-10 lg:py-10">
              <div className="space-y-6">
                <Badge variant="accent">Trade support</Badge>
                <h1 className="page-title text-primary md:text-6xl">Contact the Houston wholesale desk.</h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 md:text-lg">
                  Reach out about wholesale pricing, part availability, order status, or trade account setup.
                  The contact experience is written to feel like a real supplier, not a generic form page.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {supportSignals.map((item) => (
                    <div key={item.title} className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <item.icon className="h-5 w-5 text-accent" />
                      <h2 className="mt-4 font-semibold text-primary">{item.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.6rem] border border-hairline/70 bg-secondary/30 p-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Direct contact</p>
                  <div className="mt-4 space-y-4">
                    <a className="flex items-center gap-3 text-primary transition hover:text-accent" href="tel:+17135550199">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">(713) 555-0199</span>
                    </a>
                    <a className="flex items-center gap-3 text-primary transition hover:text-accent" href="mailto:sales@irepairtech.com">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">sales@irepairtech.com</span>
                    </a>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-hairline/70 bg-primary text-primary-foreground shadow-elegant">
                  <div className="p-5 sm:p-6">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/65">Support rhythm</p>
                    <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em]">
                      Fast response for trade buyers.
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-primary-foreground/75">
                      Use this channel for pricing requests, replenishment questions, and support from the
                      wholesaler side of the business.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.84fr]">
            <div className="shell-frame">
              <div className="shell-core p-5 sm:p-6 md:p-8">
                <div className="mb-6 space-y-3">
                  <Badge variant="outline">Message desk</Badge>
                  <h2 className="section-title text-primary">Send a wholesale inquiry.</h2>
                  <p className="text-sm text-muted-foreground">
                    Tell us what you need and the support team can respond with stock, pricing, or account guidance.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required placeholder="Your name" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required placeholder="buyer@company.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <input type="hidden" name="subject" value={subject} />
                    <Select name="subject" required value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General inquiry</SelectItem>
                        <SelectItem value="request-part">Request a part</SelectItem>
                        <SelectItem value="order">Order question</SelectItem>
                        <SelectItem value="support">Technical support</SelectItem>
                        <SelectItem value="wholesale">Wholesale pricing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={7}
                      required
                      placeholder="Tell us what part, order, or account question you have."
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full" size="lg">
                    {loading ? 'Sending...' : 'Send inquiry'}
                    {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                  </Button>
                </form>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="shell-frame">
                <div className="shell-core p-5 sm:p-6">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Preferred topics</p>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <li>Wholesale pricing and MOQ guidance</li>
                    <li>Order status and dispatch questions</li>
                    <li>Trade account access and login support</li>
                    <li>Parts availability and replenishment notes</li>
                  </ul>
                </div>
              </div>

              <div className="shell-frame">
                <div className="shell-core p-5 sm:p-6">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Company note</p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    iRepair Technologies is positioned as a real wholesaler for repair shops in Houston and
                    beyond, with language and visuals aimed at professional buyers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
