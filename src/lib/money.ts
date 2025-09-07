export const formatMoney = (
    v: number,
    currency: string,
    locale = navigator.language
) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(v)
