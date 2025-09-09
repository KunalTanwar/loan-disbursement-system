export const formatMoney = (
    v: number,
    ccy: string,
    locale = navigator.language
) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: ccy }).format(
        v
    )
