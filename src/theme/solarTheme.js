import { createTheme } from '@mui/material/styles'

export const solarColors = {
    pageBg: '#F8FAFC',
    cardBg: '#FFFFFF',
    primary: '#2563EB',
    solar: '#F59E0B',
    success: '#16A34A',
    danger: '#EF4444',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    tableHead: '#F8FAFC',
    tableHeadText: '#475569',
    cardShadow: '0px 10px 30px rgba(15, 23, 42, 0.08)',
    heroGradient: 'linear-gradient(135deg, #0F3D91 0%, #2563EB 45%, #FBBF24 100%)',
}

export const solarTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: solarColors.primary },
        success: { main: solarColors.success },
        warning: { main: solarColors.solar },
        error: { main: solarColors.danger },
        background: { default: solarColors.pageBg, paper: solarColors.cardBg },
        text: { primary: solarColors.textPrimary, secondary: solarColors.textSecondary },
        divider: solarColors.border,
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 700, letterSpacing: '-0.02em' },
        h6: { fontWeight: 700 },
        subtitle1: { fontWeight: 600 },
        body2: { color: solarColors.textSecondary },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: solarColors.pageBg },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 12,
                    transition: 'all 0.25s ease',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: { borderRadius: 18 },
            },
        },
    },
})
