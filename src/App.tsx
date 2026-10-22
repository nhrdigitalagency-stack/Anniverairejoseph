/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { eventConfig as initialEventConfig, EventConfig } from "./config/eventConfig";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Countdown } from "./components/Countdown";
import { CelebrationIntro } from "./components/CelebrationIntro";
import { Program } from "./components/Program";
import { PracticalInfo } from "./components/PracticalInfo";
import { RSVPForm } from "./components/RSVPForm";
import { BirthdayMessageForm } from "./components/BirthdayMessageForm";
import { SharedMemories } from "./components/SharedMemories";
import { GiftContactForm } from "./components/GiftContactForm";
import { Gallery } from "./components/Gallery";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { FloatingWhatsAppButton } from "./components/FloatingWhatsAppButton";
import { AdminConfigModal } from "./components/AdminConfigModal";
import { ScrollReveal } from "./components/ScrollReveal";

export default function App() {
  const [config, setConfig] = useState<EventConfig>(initialEventConfig);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF5] text-[#181818]">
      <Header celebrantName={config.celebrantName} />

      <main className="flex-1">
        <Hero config={config} />

        <ScrollReveal delayMs={60}>
          <Countdown config={config} />
        </ScrollReveal>

        <ScrollReveal>
          <CelebrationIntro celebrantName={config.celebrantName} />
        </ScrollReveal>

        <ScrollReveal>
          <Program config={config} />
        </ScrollReveal>

        <ScrollReveal>
          <PracticalInfo
            config={config}
            onOpenAdminModal={() => setAdminModalOpen(true)}
          />
        </ScrollReveal>

        <ScrollReveal>
          <RSVPForm config={config} />
        </ScrollReveal>

        <ScrollReveal>
          <SharedMemories
            config={config}
            onUpdateConfig={setConfig}
          />
        </ScrollReveal>

        <ScrollReveal>
          <BirthdayMessageForm config={config} />
        </ScrollReveal>

        {config.showGiftSection && (
          <ScrollReveal>
            <GiftContactForm config={config} />
          </ScrollReveal>
        )}

        <ScrollReveal>
          <Gallery config={config} />
        </ScrollReveal>

        <ScrollReveal>
          <FAQ config={config} />
        </ScrollReveal>
      </main>

      <Footer
        config={config}
        onOpenAdminModal={() => setAdminModalOpen(true)}
      />

      <FloatingWhatsAppButton
        whatsappNumber={config.whatsappNumber}
        whatsappDisplayNumber={config.whatsappDisplayNumber}
      />

      <AdminConfigModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        config={config}
        onUpdateConfig={setConfig}
        onResetConfig={() => setConfig(initialEventConfig)}
      />
    </div>
  );
}
