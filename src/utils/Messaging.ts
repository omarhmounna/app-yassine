export const Messaging={
    Voicemail:"Bonjour nous sommes la société Anaqah Maghribiya. Nous vous avons appelé pour confirmer la taille et la couleur de votre commande mais votre téléphone Ligne occupée ou Ne fonctionne pas!%0aمرحبا نحن شركة أناقة مغربية اتصلنا بك لتأكيد قياس ولون طلبك، ولكنك هاتفك مشغول أو غير قابل للاتصال؟",
    NoResponse: "Bonjour nous sommes la société Anaqah Maghribiya. Nous vous avons appelé pour confirmer la taille et la couleur de votre commande mais vous n'avez pas répondu au téléphone ?%0aمرحبا نحن شركة أناقة مغربية. اتصلنا بك لتأكيد قياس ولون طلبك، ولكنك لم ترد على الهاتف؟",
    Followup:"Bonjour le livreur vous a appelé aujourd'hui pour récupérer votre commande mais vous n'avez pas répondu au téléphone%0aسلام، اتصل بك مندوب التوصيل اليوم لاستلام طلبك، لكنك لم ترد على الهاتف",
    Delivery:(order)=>{
        if(order){
            const upSellProductText = order.upSellProduct ? ` + ${order.upSellProduct}` : '';
            return `*Nom :*  ${order.fullName}`+"\n"+
            `*Tele :* ${order.phoneNumber}`+"\n"+
            `*Address :* ${order.Address} ${order.city}`+"\n"+
            `*Price :* ${order.price}DH`+"\n"+
            `*Modele :* ${order.product}${upSellProductText}`+"\n"+
            `*Note :* ${order.orderFollowUp}`+"\n";
        }
        return ''
    }
    
}

export const DeliveryNumber="212613305602";