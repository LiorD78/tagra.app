#!/usr/bin/env python3
"""
Vygeneruje email3-{fleet,driver}-en.html z email2 šablon.

Mail #3 = "trial vyprší za 5 dní" (odesílá se 25. den z 30).
Recykluje strukturu #2 (hlavička, 3 kroky, CTA, box, podpis, patička),
přepisuje jen obsah.

Klíčová fakta (ověřena na tagra.app/faq/ a /fleet/):
  - nákup probíhá UVNITŘ programu: licenční menu → edice → QR/převod
  - licence aktivní okamžitě, pokračuje se ve stejném prostředí
    → uživatel NEPŘIJDE o data naimportovaná během trialu
  - roční poplatek od 2. roku (bez DPH): Trucker 19 €, TAGRA 1-2 79 €,
    TAGRA 4-6 99 €, MAX 139 €; první rok je v ceně
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / "try" / "email-preview"


def swap(html, old, new, label):
    """Nahradí právě jeden výskyt; jinak spadne."""
    n = html.count(old)
    if n != 1:
        sys.exit(f"  ✗ {label}: nalezeno {n}× (očekáváno 1×)\n     {old[:80]}")
    return html.replace(old, new)


# ─────────────────────────────────────────────────────────────
# FLEET
# ─────────────────────────────────────────────────────────────
FLEET = [
    ("title",
     "<title>TAGRA quick start: import your files and run the first report</title>",
     "<title>Your TAGRA trial ends in 5 days — here is how to keep your data</title>"),

    ("preheader",
     "  Three steps to your first infringement report \u2014 and two quick questions so I can recommend the right setup.\n",
     "  Your licence activates inside the same software \u2014 nothing you imported gets lost. From \u20ac79 a year.\n"),

    ("badge",
     ">\n                  30-day trial\n                </td>",
     ">\n                  5 days left\n                </td>"),

    ("eyebrow",
     "              Quick start for your fleet\n",
     "              Your trial is ending\n"),

    ("h1",
     "              Hi {NAME}, how is your trial going?\n",
     "              {NAME}, your trial ends in 5 days\n"),

    ("intro",
     "              A few days ago you downloaded the TAGRA trial for your fleet — thank you. Most fleet managers start like this (about 10 minutes):\n",
     "              Your 30-day TAGRA trial expires in 5 days. If it has been doing its job, you don't need to reinstall anything or import your files again — the licence activates inside the same software you are already using, and everything you have imported stays where it is. It takes about two minutes:\n"),

    ("step1-h",
     '>Install and open TAGRA</p>',
     '>Open the licence menu in TAGRA</p>'),
    ("step1-p",
     ">If the installation did not go smoothly, the guide below covers it step by step.</p>",
     ">You are already inside the program — no new download, no reinstall, no re-import.</p>"),

    ("step2-h",
     '>Import a few driver card or vehicle files</p>',
     '>Choose the edition that matches your fleet</p>'),
    ("step2-p",
     ">TAGRA reads the files from your card reader or download key and evaluates them immediately.</p>",
     ">TAGRA 1, 2, 4 or 6 by number of vehicles — or MAX for an unlimited fleet. Not sure? Just reply, see below.</p>"),

    ("step3-h",
     '>Run your first infringement report</p>',
     '>Pay by QR code or bank transfer</p>'),
    ("step3-p",
     ">This is the report inspectors ask for — TAGRA flags any driving time or rest period problems.</p>",
     ">Your licence is activated immediately and you carry on in the same environment, with all your data.</p>"),

    ("cta-href",
     'href="https://tagra.app/manuals/how-to-install-tagra/" class="btn btn-mob"',
     'href="https://tagra.app/fleet/" class="btn btn-mob"'),
    ("cta-text",
     "                    Open the step-by-step guide\n",
     "                    See editions and pricing\n"),

    ("band-title",
     "                    Curious what fits your fleet?\n",
     "                    Not sure which edition you need?\n"),
    ("band-lead",
     "                    We have the right solution for you — just reply to these two questions:\n",
     "                    Don't overpay — the edition is set by your number of vehicles. Reply with these two and I will tell you which one to pick:\n"),
    ("band-q1",
     '<strong class="dm-text" style="color:#0b2c4a;">1.</strong> How do you download data from your tachographs today — card reader, download key, or not yet solved?',
     '<strong class="dm-text" style="color:#0b2c4a;">1.</strong> How many vehicles do you manage?'),
    ("band-q2",
     '<strong class="dm-text" style="color:#0b2c4a;">2.</strong> How many vehicles do you manage?',
     '<strong class="dm-text" style="color:#0b2c4a;">2.</strong> Is there anything in the trial that did not work the way you expected?'),

    ("closing",
     "              I will suggest the right TAGRA edition and compatible hardware, so you don't pay for more than you need. I reply personally. If you manage a larger fleet, I can also arrange a guided setup consultation for you.\n",
     "              The annual licence fee starts at &euro;79 excl. VAT (TAGRA MAX &euro;139) and the first year is included in the purchase price — it covers updates and support. If something in the trial didn't work, tell me before it expires; I'd rather fix it than lose you over it. I reply personally.\n"),
]

# ─────────────────────────────────────────────────────────────
# DRIVER
# ─────────────────────────────────────────────────────────────
DRIVER = [
    ("title",
     "<title>Read your driver card in TAGRA — first steps</title>",
     "<title>Your TAGRA TRUCKER trial ends in 5 days</title>"),

    ("preheader",
     "  Three simple steps to read your driver card \u2014 and one quick question about your card reader.\n",
     "  Your licence activates inside the same software \u2014 your archived card data stays. \u20ac19 a year from year two.\n"),

    ("badge",
     ">\n                  30-day trial\n                </td>",
     ">\n                  5 days left\n                </td>"),

    ("eyebrow",
     "              First steps for drivers\n",
     "              Your trial is ending\n"),

    ("h1",
     "              Hi {NAME}, how is your trial going?\n",
     "              {NAME}, your trial ends in 5 days\n"),

    ("intro",
     "              A few days ago you downloaded the TAGRA trial — thank you. As a professional driver, you mainly need two things: to know about any infringements before an inspection finds them, and to keep your card data archived so you are covered at roadside checks. TAGRA also prepares your work reports and travel allowances from the same data. Here is how to get there (5–10 minutes):\n",
     "              Your 30-day TAGRA TRUCKER trial expires in 5 days. The archive you have built up over the past weeks is the thing that covers you at a roadside check — and you keep it. The licence activates inside the same software, so nothing is reinstalled and nothing is re-read. It takes about two minutes:\n"),

    ("step1-h",
     '>Install and open TAGRA</p>',
     '>Open the licence menu in TAGRA</p>'),
    ("step1-p",
     ">If the installation did not go smoothly, the guide below covers it step by step.</p>",
     ">You are already inside the program — no new download and no reinstall.</p>"),

    ("step2-h",
     '>Connect a USB card reader</p>',
     '>Select TAGRA TRUCKER</p>'),
    ("step2-p",
     ">Any standard smart card reader works. TAGRA detects it automatically.</p>",
     ">The edition for individual drivers — one driver card, full evaluation, archive, work reports and travel allowances.</p>"),

    ("step3-h",
     '>Insert your driver card and read it in TAGRA</p>',
     '>Pay by QR code or bank transfer</p>'),
    ("step3-p",
     ">TAGRA reads your card in seconds — it evaluates infringements, prepares work reports and travel allowances, and archives everything safely.</p>",
     ">Your licence is activated immediately and your archived card data stays exactly where it is.</p>"),

    ("cta-href",
     'href="https://tagra.app/manuals/how-to-install-tagra/" class="btn btn-mob"',
     'href="https://tagra.app/driver/" class="btn btn-mob"'),
    ("cta-text",
     "                    Open the step-by-step guide\n",
     "                    See TAGRA TRUCKER pricing\n"),

    ("band-title",
     "                    One practical question\n",
     "                    Before it expires — one question\n"),
    ("band-body",
     "                    Do you have a USB card reader? Reply to this email with <strong class=\"dm-text\" style=\"color:#0b2c4a;\">&quot;reader: yes&quot;</strong> or <strong class=\"dm-text\" style=\"color:#0b2c4a;\">&quot;reader: no&quot;</strong>. If you don't have one, I will recommend a compatible model \u2014 TAGRA TRUCKER ships with a reader included.\n",
     "                    Did anything in the trial not work the way you expected \u2014 reading the card, an infringement you disagree with, or the archive? Reply and tell me before it expires. I would rather fix it than have you leave over something that takes me five minutes to solve.\n"),

    ("closing",
     "              If you have any questions, please reply to this email. I read and answer every one.\n",
     "              TAGRA TRUCKER costs &euro;19 excl. VAT per year from the second year — the first year is included in the purchase price, and it covers updates and support. If you still don't have a USB card reader, reply and I will recommend a compatible model; TRUCKER ships with a reader included.\n"),
]


def build(audience, edits):
    src = TPL / f"email2-{audience}-en.html"
    dst = TPL / f"email3-{audience}-en.html"
    html = src.read_text(encoding="utf-8")

    for label, old, new in edits:
        html = swap(html, old, new, f"{audience}/{label}")

    dst.write_text(html, encoding="utf-8")
    print(f"  ✓ {dst.relative_to(ROOT)}  ({len(edits)} náhrad)")


if __name__ == "__main__":
    print("Generuji mail #3 (trial vyprší za 5 dní):")
    build("fleet", FLEET)
    build("driver", DRIVER)
