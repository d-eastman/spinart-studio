import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface GalleryEntry {
  file: string
  title: string
  author: string
}

export function Gallery() {
  const [entries, setEntries] = useState<GalleryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}gallery/manifest.json`)
      .then((r) => r.json())
      .then((data: GalleryEntry[]) => setEntries(data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at 20% 80%, rgba(216,67,115,0.07) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(199,122,0,0.07) 0%, transparent 50%),
        #f5f0eb
      `,
      color: '#2d2222',
    }}>
      {/* Header */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '12px 20px',
      }}>
        <Link to="/" style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 26,
          letterSpacing: 3,
          lineHeight: 1,
          textDecoration: 'none',
        }}>
          <span style={{ color: '#d84373' }}>SPIN</span>
          <span style={{ color: '#c77a00' }}>ART</span>
        </Link>

        <div style={{ width: 1, height: 24, background: '#c8bfb6' }} aria-hidden="true" />

        <span style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 14,
          color: '#6b5e5e',
          letterSpacing: 1,
          fontWeight: 'bold',
        }}>
          GALLERY
        </span>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 20px 40px' }}>
        <p style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 13,
          color: '#6b5e5e',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          Community spin-art creations. Want to add yours?{' '}
          <a
            href="https://github.com/d-eastman/spinart-studio/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#d84373' }}
          >
            Fork &amp; submit a PR!
          </a>
        </p>

        {loading ? (
          <p style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', color: '#6b5e5e' }}>
            Loading...
          </p>
        ) : entries.length === 0 ? (
          <p style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', color: '#6b5e5e' }}>
            No gallery images yet. Be the first to contribute!
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 20,
          }}>
            {entries.map((entry) => (
              <figure key={entry.file} style={{
                margin: 0,
                background: '#faf7f4',
                borderRadius: 12,
                overflow: 'hidden',
                border: '2px solid #e8e0d8',
                transition: 'box-shadow 0.15s',
              }}>
                <img
                  src={`${import.meta.env.BASE_URL}gallery/${entry.file}`}
                  alt={entry.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <figcaption style={{
                  padding: '10px 14px',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 13,
                }}>
                  <div style={{ fontWeight: 'bold', color: '#2d2222' }}>{entry.title}</div>
                  <div style={{ fontSize: 11, color: '#6b5e5e', marginTop: 2 }}>by {entry.author}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
