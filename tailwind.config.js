/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        "BP-black": "#111111",
        "BP-purple": "#571C86",
        "BP-hovered-purple": "#6A2D9B",
        "BP-light-purple": "#E5D8F0",
        "BP-gold": "#E1A80D",
        "BP-lightbaige": "#F8F5ED",
        "BP-opacited-white": "rgba(255, 255, 255, 0.8)",
        "BP-nav-gray": "#7A7A7A",
        "BP-gray-20-opc": "#42424033",
        "BP-gray-50-opc": "#42424080",
        "BP-gray-100-opc": "#424240",
        "BP-gold-gradient-start": "#F9F2A3",
        "BP-gold-gradient-end": "#EBAA37",
        "BP-dark-grayish-blue": "#111828",
        "BP-yellow": "#E1AB0D",
        "BP-hovered-yellow": "#F5C21A",
        "BP-flatstate-gray": "#D1D5DB",
        "BP-hovered-gray": "#9CA3AF",
        "BP-blue": "#2C5282",
        "BP-slate-gray": "#7b8ba1",
        "BP-violet": "#A855F7",
        "BP-light-gray": "#b0b7c3",
        "bp-pink": "#fb7185",
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-dark': 'var(--color-primary-dark)',
        success: 'var(--color-success)',
        'success-light': 'var(--color-success-light)',
        'success-dark': 'var(--color-success-dark)',
        error: 'var(--color-error)',
        'error-light': 'var(--color-error-light)',
        'error-dark': 'var(--color-error-dark)',
        'button-primary': 'var(--color-button-primary)',
        'button-primary-hover': 'var(--color-button-primary-hover)',
        'button-secondary': 'var(--color-button-secondary)',
        'button-secondary-hover': 'var(--color-button-secondary-hover)',
        'button-success': 'var(--color-button-success)',
        'button-success-hover': 'var(--color-button-success-hover)',
        'button-error': 'var(--color-button-error)',
        'button-error-hover': 'var(--color-button-error-hover)',
        'button-disabled': 'var(--color-button-disabled)',
        surface: 'var(--color-surface)',
        'surface-light': 'var(--color-surface-light)',
        'surface-dark': 'var(--color-surface-dark)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-disabled': 'var(--color-text-disabled)',
        'text-inverse': 'var(--color-text-inverse)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        laser: 'var(--color-laser)',
        nanotube: 'var(--color-nanotube)',
        sensor: 'var(--color-sensor)',
        sulfide: 'var(--color-sulfide)',
      },
      fontFamily: {
        title: ['Karla', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'heading-xl': ['2rem', { lineHeight: '1.2', fontWeight: '500' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-base': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
        'label': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'link': ['1rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      keyframes: {
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        bounceshort: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseradiation: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(242, 183, 5, 0.7)'
          },
          '50%': {
            transform: 'scale(1.5)',
            boxShadow: '0 0 0 20px rgba(242, 183, 5, 0)'
          }
        },
        pulseglow: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(242, 183, 5, 0.4)'
          },
          '50%': {
            transform: 'scale(1.2)',
            boxShadow: '0 0 0 10px rgba(242, 183, 5, 0)'
          }
        },
      },
      animation: {
        slideInLeft: 'slideInLeft 0.7s ease-out',
        slideInRight: 'slideInRight 0.7s ease-out',
        rotate: 'rotate 2s linear infinite',
        bounceshort: 'bounce-short 0.5s ease-in-out',
        pulseradiation: 'pulseradiation 1.5s infinite',
        pulseglow: 'pulseglow 2s infinite',
      },
    },
  },
  variants: {
    extend: {
      screens: {
        md: '768px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities);
    },
    function({ addUtilities, theme }) {
      const titleFont = Array.isArray(theme('fontFamily.title')) ? theme('fontFamily.title').join(', ') : theme('fontFamily.title');
      const bodyFont = Array.isArray(theme('fontFamily.body')) ? theme('fontFamily.body').join(', ') : theme('fontFamily.body');
      const headingColor = theme('colors.BP-blue') || '#2C5282';
      const mutedColor = theme('colors["bp-dark-grayish-blue"]') || theme('colors.bp-dark-grayish-blue') || '#111828';
      const lightGray = theme('colors.BP-light-gray') || '#b0b7c3';

      const typographyUtilities = {
        '.h1': {
          fontFamily: titleFont,
          fontWeight: '700',
          fontSize: '2rem',
          lineHeight: '36px',
          color: headingColor,
          letterSpacing: '-0.01em',
        },
        '.h2': {
          fontFamily: titleFont,
          fontWeight: '600',
          fontSize: '1.5rem',
          lineHeight: '32px',
          color: headingColor,
          letterSpacing: '0em',
        },
        '.h3': {
          fontFamily: titleFont,
          fontWeight: '600',
          fontSize: '1.25rem',
          lineHeight: '28px',
          color: headingColor,
          letterSpacing: '0em',
        },
        '.h4': {
          fontFamily: titleFont,
          fontWeight: '500',
          fontSize: '1rem',
          lineHeight: '24px',
          color: headingColor,
          letterSpacing: '0em',
        },
        '.h5': {
          fontFamily: titleFont,
          fontWeight: '500',
          fontSize: '0.875rem',
          lineHeight: '20px',
          color: headingColor,
          letterSpacing: '0em',
        },
        '.body': {
          fontFamily: bodyFont,
          fontWeight: '400',
          fontSize: '0.875rem',
          lineHeight: '20px',
          color: mutedColor,
          letterSpacing: '0em',
        },
        '.body1': {
          fontFamily: bodyFont,
          fontWeight: '400',
          fontSize: '1rem',
          lineHeight: '16px',
          color: mutedColor,
          letterSpacing: '0em',
        },
        '.body2': {
          fontFamily: bodyFont,
          fontWeight: '400',
          fontSize: '0.75rem',
          lineHeight: '16px',
          color: mutedColor,
          letterSpacing: '0em',
        },
        '@media (min-width: 768px)': {
          '.h1': {
            fontSize: '2.5rem',
            lineHeight: '48px',
            letterSpacing: '-0.02em',
            fontWeight: '700',
            color: headingColor,
          },
          '.h2': {
            fontSize: '2rem',
            lineHeight: '40px',
            letterSpacing: '-0.01em',
            fontWeight: '600',
            color: headingColor,
          },
          '.h3': {
            fontSize: '1.5rem',
            lineHeight: '32px',
            letterSpacing: '0em',
            fontWeight: '600',
            color: headingColor,
          },
          '.h4': {
            fontSize: '1.25rem',
            lineHeight: '28px',
            letterSpacing: '0em',
            fontWeight: '500',
            color: headingColor,
          },
          '.h5': {
            fontSize: '1rem',
            lineHeight: '24px',
            letterSpacing: '0em',
            fontWeight: '400',
            color: headingColor,
          },
          '.body': {
            fontSize: '1rem',
            lineHeight: '24px',
            letterSpacing: '0em',
            fontWeight: '400',
            color: mutedColor,
          },
          '.body1': {
            fontSize: '0.875rem',
            lineHeight: '20px',
            letterSpacing: '0em',
            fontWeight: '400',
            color: mutedColor,
          },
          '.body2': {
            fontSize: '0.75rem',
            lineHeight: '16px',
            letterSpacing: '0em',
            fontWeight: '400',
            color: mutedColor,
          },
        }
      };

      addUtilities(typographyUtilities, { variants: ['responsive'] });
    }
  ],
};
