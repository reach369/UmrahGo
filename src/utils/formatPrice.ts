// دالة لتنسيق السعر بالريال السعودي
export function formatePrice(value:number){
    return new Intl.NumberFormat('ar-SA',{
        style:'currency',
        currency:"SAR"
    }).format(value);
}