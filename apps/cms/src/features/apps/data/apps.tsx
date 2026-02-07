import { Mail } from 'lucide-react'
import {
  IconTelegram,
  IconNotion,
  IconFigma,
  IconTrello,
  IconSlack,
  IconZoom,
  IconStripe,
  IconGmail,
  IconMedium,
  IconSkype,
  IconDocker,
  IconGithub,
  IconGitlab,
  IconDiscord,
  IconWhatsapp,
} from '@/assets/brand-icons'

export type App = {
  id: string
  name: string
  logo: React.ReactNode
  connected: boolean
  desc: string
}

export const apps: App[] = [
  {
    id: 'email-imap',
    name: 'Email (IMAP/SMTP)',
    logo: <Mail size={20} />,
    connected: false,
    desc: 'Connect any email account using IMAP/SMTP with app password.',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    logo: <IconTelegram />,
    connected: false,
    desc: 'Connect with Telegram for real-time communication.',
  },
  {
    id: 'notion',
    name: 'Notion',
    logo: <IconNotion />,
    connected: true,
    desc: 'Effortlessly sync Notion pages for seamless collaboration.',
  },
  {
    id: 'figma',
    name: 'Figma',
    logo: <IconFigma />,
    connected: true,
    desc: 'View and collaborate on Figma designs in one place.',
  },
  {
    id: 'trello',
    name: 'Trello',
    logo: <IconTrello />,
    connected: false,
    desc: 'Sync Trello cards for streamlined project management.',
  },
  {
    id: 'slack',
    name: 'Slack',
    logo: <IconSlack />,
    connected: false,
    desc: 'Integrate Slack for efficient team communication',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    logo: <IconZoom />,
    connected: true,
    desc: 'Host Zoom meetings directly from the dashboard.',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: <IconStripe />,
    connected: false,
    desc: 'Easily manage Stripe transactions and payments.',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    logo: <IconGmail />,
    connected: true,
    desc: 'Access and manage Gmail messages effortlessly.',
  },
  {
    id: 'medium',
    name: 'Medium',
    logo: <IconMedium />,
    connected: false,
    desc: 'Explore and share Medium stories on your dashboard.',
  },
  {
    id: 'skype',
    name: 'Skype',
    logo: <IconSkype />,
    connected: false,
    desc: 'Connect with Skype contacts seamlessly.',
  },
  {
    id: 'docker',
    name: 'Docker',
    logo: <IconDocker />,
    connected: false,
    desc: 'Effortlessly manage Docker containers on your dashboard.',
  },
  {
    id: 'github',
    name: 'GitHub',
    logo: <IconGithub />,
    connected: false,
    desc: 'Streamline code management with GitHub integration.',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    logo: <IconGitlab />,
    connected: false,
    desc: 'Efficiently manage code projects with GitLab integration.',
  },
  {
    id: 'discord',
    name: 'Discord',
    logo: <IconDiscord />,
    connected: false,
    desc: 'Connect with Discord for seamless team communication.',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    logo: <IconWhatsapp />,
    connected: false,
    desc: 'Easily integrate WhatsApp for direct messaging.',
  },
]
