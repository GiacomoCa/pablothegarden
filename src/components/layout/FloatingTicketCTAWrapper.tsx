import { getTickets } from '@/lib/content';
import FloatingTicketCTA from './FloatingTicketCTA';

export default function FloatingTicketCTAWrapper() {
  const ticketConfig = getTickets();

  return <FloatingTicketCTA ticketConfig={ticketConfig} />;
}
