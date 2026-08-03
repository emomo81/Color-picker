import { CheckIcon } from './icons.jsx'

/** Toast — small confirmation pill anchored bottom-centre. */
export default function Toast({ message }) {
  return (
    <div className={`toast${message ? ' is-visible' : ''}`} role="status" aria-live="polite">
      {message && (
        <>
          <span className="toast__icon" aria-hidden="true">
            <CheckIcon size={14} />
          </span>
          {message}
        </>
      )}
    </div>
  )
}
