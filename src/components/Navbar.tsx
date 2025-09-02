import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

// Props for customizing logo, auth state, and sign-out action
type Props = {
  logoSrc?: string;
  logoClassName?: string;
  onSignOut?: () => void;
  isAuthed?: boolean;
};

export default function Navbar({
  logoSrc,
  logoClassName,
  onSignOut,
  isAuthed,
}: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on ESC key or outside click
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !btnRef.current?.contains(t)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // Base styles for navigation links
  const linkBase =
    "block px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2";
  const linkActive = "text-yellow-700 bg-yellow-50";
  const linkIdle = "text-gray-700 hover:text-gray-900 hover:bg-gray-100";

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo: image or fallback text */}
          <Link to="/" className="flex items-center gap-2">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Audiovisium"
                className={logoClassName ?? "h-10 w-auto md:h-12"} // Default size if no prop passed
              />
            ) : (
              <span className="text-xl md:text-2xl font-bold text-yellow-600 tracking-tight">
                Audiovisium
              </span>
            )}
          </Link>

          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
              end
            >
              Work
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              Contact
            </NavLink>

            {/* Authenticated state: show Admin + Logout */}
            {isAuthed ? (
              <>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Admin
                </NavLink>
                <button
                  onClick={onSignOut}
                  className="ml-1 px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 focus:ring-2"
                >
                  Logout
                </button>
              </>
            ) : (
              // If not logged in: show Login
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <button
            ref={btnRef}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2"
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label="Open main menu"
          >
            {open ? (
              // X icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile navigation panel */}
        <div
          id="mobile-menu"
          ref={panelRef}
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="mt-2 pb-3 space-y-1">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
              end
            >
              Work
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              Contact
            </NavLink>

            {/* Authenticated state in mobile menu */}
            {isAuthed ? (
              <>
                <NavLink
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Admin
                </NavLink>
                <button
                  onClick={() => {
                    setOpen(false);
                    onSignOut?.();
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 focus:ring-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
