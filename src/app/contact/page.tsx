
'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ContactPage() {
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
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-2xl">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-display font-bold">Contact Us</h1>
            <p className="text-muted-foreground">
              Get in touch with our team. We typically respond within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 border border-border bg-card p-8 shadow-card">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <input type="hidden" name="subject" value={subject} />
              <Select name="subject" required value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="request-part">Request a Part</SelectItem>
                  <SelectItem value="order">Order Question</SelectItem>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="wholesale">Wholesale Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={6} required />
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-primary text-white">
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
