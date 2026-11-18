export default function Veil({ on }) {
  return <div className={`veil${on ? ' is-on' : ''}`} aria-hidden="true" />;
}
