const { google } = require('googleapis')
const axios = require('axios')
const { dockStart } = require('@nlpjs/basic');

const {
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY
} = process.env

const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n')
const modelUrl = 'https://graduate-16c74.firebaseio.com/trainedModel.json'
const trainingHistoryUrl = 'https://graduate-16c74.firebaseio.com/trainingHistory.json/'
const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/firebase.database"
];
const jwt = new google.auth.JWT(GOOGLE_CLIENT_EMAIL, null, privateKey, scopes);

exports.handler = async function (event, context) {
    const receivedMessage = event.queryStringParameters.message
    const receivedQuickAnswer = event.queryStringParameters.quickAnswer

    const fakeData = {
        "start": {
            "value": "start",
            "message": "Hej! Ik ben de digitale assistent van LOAVIES. Waar wil je iets over vragen?",
            "quickAnswers": [
                "retourneren",
                "bezorging",
                "bestellen",
                "betalen",
                "kortingen",
                "overig"
            ],
            "externalLinks": []
        },
        "start.betalen": {
            "value": "betalen",
            "message": "kies een onderwerp om meer informatie over te krijgen.",
            "quickAnswers": [
                "afterPay",
                "terugbetaling",
                "afbetaling"
            ],
            "externalLinks": []
        },
        "start.betalen.afterPay": {
            "value": "afterPay",
            "message": "Een betaling door middel van AfterPay kan door verschillende oorzaken worden geweigerd. Wegens privacy hebben wij hier helaas geen inzicht op. AfterPay kan je precies uitleggen waarom je betaling wordt geweigerd, wij raden je daarom aan om contact op te nemen met de klantenservice van AfterPay.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "afterPay klantenservice",
                    "url": "https://www.afterpay.nl/nl/consumenten/vraag-en-antwoord/"
                }
            ]
        },
        "start.betalen.terugbetaling": {
            "value": "terugbetaling",
            "message": "De manier waarop jij jouw terugbetaling ontvangt is afhankelijk van de betaalmethode die jij gekozen hebt.\n\nAfterPay\nZodra je retour e/o wijziging verwerkt is, ontvang je binnen 24 uur een aangepaste factuur van AfterPay. Heb jij je AfterPay factuur al betaald? In dat geval ontvang je binnen 3 werkdagen een terugbetaling op je bankrekening namens AfterPay.\n\nBancontact\nZodra je retour e/o wijziging verwerkt is, ontvang je de terugbetaling op het zelfde rekeningnummer als de rekening waarmee jij jouw bestelling betaald hebt. Binnen drie werkdagen zal het bedrag weer terug op jouw rekening staan. Credit Card (American Express, Visa, Maestro & Mastercard) Zodra je retour e/o wijziging verwerkt is, ontvang je de terugbetaling op het zelfde rekeningnummer als de rekening waarmee jij jouw bestelling betaald hebt. Binnen drie werkdagen zal het bedrag als krediet weer beschikbaar zijn op jouw creditcard. \n\nGiftcard\nZodra je retour e/o wijziging verwerkt is, wordt het bedrag automatisch weer op je huidige giftcard gezet.\n\niDEAL\nZodra je retour e/o wijziging verwerkt is, ontvang je de terugbetaling op het zelfde rekeningnummer als de rekening waarmee jij jouw bestelling betaald hebt. Binnen drie werkdagen zal het bedrag weer terug op jouw rekening staan.\n\nPayPal\nZodra je retour e/o wijziging verwerkt is, hebben wij een terugbetalingsverzoek ingediend bij PayPal. PayPal zal dit binnen 5 werkdagen verwerken.",
            "quickAnswers": [
                ""
            ],
            "externalLinks": []
        },
        "start.betalen.betalingsmethode": {
            "value": "betalingsmethode",
            "message": "In Nederland kan je de volgende betalingsmogelijkheden gebruiken:\n\n- AfterPay\n- Credit Card (American Express, Visa, Maestro & Mastercard)\n- iDEAL\n- PayPal\n\n\nIn België kan je de volgende betalingsmogelijkheden gebruiken:\n\n- AfterPay\n- Bancontact\n- Credit Card (American Express, Visa, Maestro & Mastercard)\n- PayPal",
            "quickAnswers": [
                ""
            ],
            "externalLinks": []
        },
        "start.kortingen": {
            "value": "kortingen",
            "message": "kies een onderwerp om meer informatie over te krijgen.",
            "quickAnswers": [
                "kortingscode vergeten in te vullen",
                "kortingscode gebruiken",
                "kortingscode werkt niet",
                "afprijzing na bestelling"
            ],
            "externalLinks": []
        },
        "start.kortingen.kortingscodeVergetenInTeVullen": {
            "value": "kortingscode vergeten in te vullen",
            "message": "Stuur ons een bericht zodra je jouw bestelling hebt ontvangen en hebt besloten of je de item(s) wilt houden. Stuur je items retour? Stuur ons dan een bericht zodra jouw retour is verwerkt en terugbetaald. Mocht de korting geldig zijn op jouw bestelling, dan zullen wij de korting achteraf voor je verwerken. (Let op! Dit is niet geldig op persoonlijke kortingen.)",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Customer care",
                    "url": "/"
                }
            ]
        },
        "start.kortingen.kortingscodeGebruiken": {
            "value": "kortingscode gebruiken",
            "message": "Kortingscode\nEen kortingscode kun je bij de betaalpagina toepassen. De kortingscode voer je bij “Pas kortingscode toe” in. Per bestelling kun je één kortingscode gebruiken. \n\nLOAVIES Giftcard\nEen LOAVIES cadeaubon is een cadeaubon die is uitgegeven door LOAVIES. Je kan de code bij het veld ''Pas cadeauboncode toe'' invullen. De code is een jaar geldig en je kan de giftcard in meerdere delen besteden. Een LOAVIES giftcard is ingesteld op een e-mail adres. Ontvang je een foutmelding, dan kan het zijn dat je niet het juiste e-mail adres hebt gebruikt bij je gegevens.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.kortingen.kortingscodeWerktNiet": {
            "value": "kortingscode werkt niet",
            "message": "Dit kan verschillende oorzaken hebben. Denk hierbij aan de volgende punten:\n\n- Voor sommige kortingscodes heb je een account nodig. \n- De meeste kortingscodes hebben bepaalde voorwaarden het kan zijn dat jouw bestelling niet aan de voorwaarden voldoet. \n- Kortingscodes zijn niet geldig op SALE artikelen.\n- Let goed op tot wanneer de kortingscode geldig is. \n\n\nMocht het niet aan de bovenstaande punten liggen dan raden wij je aan om de bestelling alsnog te plaatsen. Stuur ons een bericht zodra je jouw bestelling hebt ontvangen en hebt besloten of je de item(s) wilt houden. Stuur je items retour? Stuur ons dan een bericht zodra jouw retour is verwerkt en terugbetaald. Mocht de korting geldig zijn op jouw bestelling, dan zullen wij de korting achteraf voor je verwerken. (Let op! Dit is niet geldig op persoonlijke kortingen.)",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Customer care",
                    "url": "/"
                }
            ]
        },
        "start.kortingen.afprijzingNaBestelling": {
            "value": "afprijzing na bestelling",
            "message": "Als de SALE binnen 48 uur gestart is na het plaatsen van je bestelling, vergoeden wij het verschil van de bedragen van de items die je houdt door middel van een LOAVIES Giftcard.\n\nStuur ons een bericht zodra je jouw bestelling hebt ontvangen en hebt besloten of je de item(s) wilt houden. Stuur je items retour? Stuur ons dan een bericht zodra jouw retour is verwerkt en terugbetaald. Je ontvangt dan een Giftcard ter waarde van het verschil van de kortingsbedragen van de items.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Customer care",
                    "url": "/"
                }
            ]
        },
        "start.bezorging": {
            "value": "bezorging",
            "message": "kies een onderwerp om meer informatie over te krijgen.",
            "quickAnswers": [
                "levertijden en verzendkosten",
                "bestelling volgen",
                "niet thuis bij bezorging",
                "bezorgen bij DHL service point",
                "pakket verkeerd gesorteerd",
                "COVID en bezorging",
                "COVID en service point"
            ],
            "externalLinks": []
        },
        "start.bezorging.levertijdenEnVerzendkosten": {
            "value": "levertijden en verzendkosten",
            "message": "Je kan de levertijden en verzendkosten vinden op onze bezorg pagina.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Bezorgingspagina",
                    "url": "https://www.loavies.com/nl/retouren/"
                }
            ]
        },
        "start.bezorging.bestellingVolgen": {
            "value": "bestelling volgen",
            "message": "Zodra jouw pakket is verzonden ontvang je een e-mail van ons met daarin een Track & Trace. Hier kan je de status van de zending inzien en kan je (indien mogelijk) de bezorger verdere instructie geven over jouw levering.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bezorging.nietThuisBijBezorging": {
            "value": "niet thuis bij bezorging",
            "message": "Nederland\n\nBen je niet thuis op het moment dat jouw pakket wordt bezorgt dan biedt DHL je pakket aan bij de buren. De bezorger laat een bezorger-gemist-kaart achter in je brievenbus met daarop het adres waar je pakket is afgeleverd. Indien deze optie niet mogelijk is laat DHL een bezorgcode achter op de bezorger-gemist-kaart. Hiermee kan je zelf online aangeven waar en wanneer DHL jouw pakket gratis opnieuw kan bezorgen.\n\nBelgië\n\nBen je niet thuis op het moment dat jouw pakket wordt bezorgt dan zal Bpost een afwezigheidsbericht in de brievenbus achterlaten. Dit bericht geeft duidelijk weer waar en wanneer je je zending kan ophalen.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bezorging.bezorgenBijDHLServicePoint": {
            "value": "bezorgen bij DHL service point",
            "message": "In Nederland is het mogelijk om je pakket bij een DHL Servicepunt te laten bezorgen. \n\nKies als verzendmethode  ‘’Pick up” en selecteer jouw gewenste servicepunt.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bezorging.pakketVerkeerdGesorteerd": {
            "value": "pakket verkeerd gesorteerd",
            "message": "In dit geval moet jouw bestelling eerst opnieuw gesorteerd worden. Wij raden je aan om de Track & Trace goed in de gaten te houden. Zodra er een nieuwe leverdatum bekend is zal dit zichtbaar worden gemaakt in de Track & Trace. Mocht je bestelling na 5 werkdagen nog steeds niet geleverd zijn, dan raden wij je aan om contact op te nemen met onze Customer Care.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Customer care",
                    "url": "/"
                }
            ]
        },
        "start.bezorging.COVIDEnBezorging": {
            "value": "COVID en bezorging",
            "message": "Ondanks de enorme impact van het COVID-19 virus wordt je bestelling bij LOAVIES nog steeds verstuurd en afgeleverd. We volgen alle ontwikkelingen op de voet en zullen er alles aan doen om de pakketten te blijven bezorgen.\n\nWe houden je in de bevestigingsmail op de hoogte over de status van jouw order.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "COVID-19 beleid",
                    "url": "https://www.loavies.com/nl/campaigns/covid-19-beleid/"
                },
                {
                    "value": "COVID-19 DHL",
                    "url": "https://dhlparcel.nl/nl/zakelijk/corona-europa?dm_i=1VEJ,6TI91,R1B1N9,RB9BK,1"
                },
                {
                    "value": "COVID-19 Bpost",
                    "url": "https://news.bpost.be/nl-corona"
                }
            ]
        },
        "start.bezorging.COVIDEnServicePoint": {
            "value": "COVID en service point",
            "message": "Onze vervoerders houden goed in de gaten welke servicepunten niet meer beschikbaar zijn. Mocht een servicepunt gesloten zijn dan zal dit zo snel mogelijk worden aangepast in ons systeem. Het is op dat moment tijdelijk niet meer mogelijk gebruik te maken van dit servicepunt. Mocht een servicepunt sluiten tijdens de bezorging van je bestelling dan wordt jouw bestelling automatisch naar een ander servicepunt gebracht. Het is voor ons helaas niet mogelijk dit servicepunt te wijzigen. \n\nWij adviseren je om je pakket thuis af te laten leveren zodat je zo min mogelijk de deur uit hoeft. De bezorger zal jouw pakket op een contactloze manier bezorgen.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.retourneren": {
            "value": "retourneren",
            "message": "kies een onderwerp om meer informatie over te krijgen.",
            "quickAnswers": [
                "verwerking en terugbetaling",
                "aanpassing AfterPay factuur",
                "bestelling retourneren",
                "meerdere bestellingen retour samenvoegen",
                "retoursvoorwaarden",
                "geen pakbon",
                "geen retouretiket ontvangen",
                "retourneertermijn",
                "COVID en retourneren",
                "bestelling omruilen",
                "SALE items retourneren"
            ],
            "externalLinks": []
        },
        "start.retourneren.verwerkingEnTerugbetaling": {
            "value": "verwerking en terugbetaling",
            "message": "Wanneer je het pakket retour verstuurd hebt, duurt het maximaal 15 werkdagen voordat we je retour hebben ontvangen en verwerkt. Zodra je retour bij ons is verwerkt, ontvang je een e-mail met daarin verdere informatie over je terugbetaling/ruiling.\n\nMocht je na 15 werkdagen nog geen bericht van ons hebben ontvangen, dan raden wij je aan om contact met onze Customer Care op te nemen.\n\nLet op! Het kan voorkomen dat jouw retour in meerdere delen wordt verwerkt.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.retourneren.aanpassingAfterPayFactuur": {
            "value": "aanpassing AfterPay factuur",
            "message": "Zodra wij jouw retour hebben ontvangen en verwerkt*, wordt er een aanpassing gemaakt op je factuur. Je ontvangt dan binnen 24 uur een aangepaste factuur van AfterPay, bijgesteld op basis van je retourzending.\n\nHet fijne aan AfterPay is dat je niet je volledige factuur van te voren dient te voldoen. Wel raden wij je aan om je factuur tijdig te betalen, om verhoging van kosten te voorkomen.\n\nHeb je je AfterPay factuur al betaald en uiteindelijk items geretourneerd? In dit geval ontvang je een terugbetaling van AfterPay zodra wij jouw retour ontvangen en verwerkt hebben.\n\nBen je al bekend met de AfterPay app? Met de AfterPay app heb je een overzicht over je bestellingen en kun je onder andere je factuur ‘’on hold’’ zetten of retouren aanmelden.\n\nKijk voor meer informatie op https://www.afterpay.nl/nl/app.\n* voor meer informatie over de duur van onze retourverwerking bekijk: Hoelang duurt een terugbetaling en de retourverwerking?",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "AfterPay",
                    "url": "https://www.afterpay.nl/nl/app"
                }
            ]
        },
        "start.retourneren.bestellingRetourneren": {
            "value": "bestelling retourneren",
            "message": "Meld jouw retour aan via onze retour pagina en volg onderstaande stappen: \n\nAanmelden: selecteer de items die jij wilt retourneren en kies de gewenste retour methode.Inpakken: pak je items in en plak het retouretiket op het pakket. Vergeet niet om het oude verzendetiket te verwijderen.Breng je pakket naar een DHL ServicePoint of laat je pakket ophalen door gebruik te maken van de DHL Ophaalservice (afhankelijk van welke retour methode je hebt gekozen).Terugbetaling: zodra we je retourzending ontvangen, wordt het aankoopbedrag binnen 15 werkdagen teruggestort. Indien je artikelen nog niet hebt betaald, wordt het bedrag op de openstaande rekening in mindering gebracht.Let op! in België is het niet mogelijk om met DHL je pakket te retourneren. \n\nJe ontvangt van de baliemedewerker of bezorger een verzendbewijs met daarop een Track & Trace code. Bewaar het verzendbewijs goed totdat je retour volledig is verwerkt en is terugbetaald. \n\nZonder een geldig verzendbewijs met daarop een Track & Trace code kunnen wij geen onderzoek starten naar vermiste retouren en zullen wij dus niets terugbetalen.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Retourpagina",
                    "url": "https://www.loavies.com/nl/retouren/"
                }
            ]
        },
        "start.retourneren.meerdereBestellingenRetourSamenvoegen": {
            "value": "meerdere bestellingen retour samenvoegen",
            "message": "Het is mogelijk om maximaal twee bestellingen in één pakket te retourneren. Het is wel belangrijk dat de juiste pakbonnen of papieren aan dit pakket worden toegevoegd. Hierbij moet de volgende informatie per bestelling aanwezig zijn:\n\n- Bestelnummer.- Productcodes van de items die je retour stuurt.- De reden van retour.- Of je de/het item(s) zou willen ruilen voor een andere maat (Zo ja, dan ook de gewenste maat.).\n\nZodra wij je retour(en) ontvangen hebben, ontvang je daarvan retourbevestiging per bestelling.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.retourneren.retoursvoorwaarden": {
            "value": "retoursvoorwaarden",
            "message": "De items die je wil retourneren dienen ongedragen te zijn en alle tags zijn nog aan het artikel bevestigd. Het item bevat geen gebruikssporen of overige vlekken.\n\nSieraden en mondkapjes kunnen i.v.m. hygiëne alleen worden geretourneerd indien de verpakking niet is aangebroken. \n\nBikini's mogen alleen worden geretourneerd als de hygiëne strip niet is verwijderd.\n\nLet op! Wanneer een artikel niet voldoet aan onze retourvoorwaarden, kun je deze helaas niet retourneren. Onze retourverwerking stelt aan de hand van diverse toetsingen vast of een retour gestuurd artikel voldoet aan de voorwaarden. Voldoet je retour niet aan de voorwaarden, dan kunnen we deze niet verwerken en niet overgaan tot terugbetaling.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.retourneren.geenPakbon": {
            "value": "geen pakbon",
            "message": "In dit geval is het belangrijk om een papier bij jouw retour pakket in te doen met daarop de volgende informatie:\n\n- Bestelnummer.- Productcodes van de items die je retour stuurt.- De reden van retour.- Of je de/het item(s) zou willen ruilen voor een andere maat (Zo ja, dan ook de gewenste maat.)",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.retourneren.geenRetouretiketOntvangen": {
            "value": "geen retouretiket ontvangen",
            "message": "Het kan zijn dat je retouretiket in je spambox terecht is gekomen! Mocht dit niet het geval zijn dan dan raden wij je aan om contact op te nemen met onze Customer Care.\n\nVergeet niet om een screenshot van je betalingsafschrift van het etiket mee te sturen.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Customer care",
                    "url": "/"
                }
            ]
        },
        "start.retourneren.retourneertermijn": {
            "value": "retourneertermijn",
            "message": "Je hebt het recht om jouw bestelling te herroepen en retour te sturen binnen ons retourtermijn van 14 dagen. Binnen dit termijn kun je jouw aankoop beoordelen en passen.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.retourneren.COVIDEnRetourneren": {
            "value": "COVID en retourneren",
            "message": "Op dit moment zijn al onze retour mogelijkheden nog steeds beschikbaar. Onze retour partner Returnista heeft de nodige maatregelingen genomen voor hun medewerkers en onze klanten. Via onze retour pagina is het mogelijk om een retouretiket aan te maken om je pakket af te geven bij een DHL servicepunt of je kunt een ophaalafspraak maken. Wanneer je niet in de mogelijkheid bent om je pakket af te geven bij een servicepunt raden wij je aan om gebruik te maken van de ophaalafspraak.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "COVID-19 beleid",
                    "url": "https://www.loavies.com/nl/campaigns/covid-19-beleid/"
                }
            ]
        },
        "start.retourneren.bestellingOmruilen": {
            "value": "bestelling omruilen",
            "message": "Wanneer het artikel voldoet aan onze voorwaarden kun je deze omruilen voor een andere maat. Bij het aanmelden van jouw retour kan je het item ruilen voor een andere maat.\n\nZodra we jouw retour hebben ontvangen, wordt er gekeken of de gewenste maat op voorraad is. Wanneer dit het geval is, wordt dit artikel kosteloos naar je verstuurd. \n\nJe ontvangt dezelfde dag nog een bevestiging dat jouw bestelling onderweg is. \n\nMocht de gewenste maat toch niet op voorraad zijn dan ontvang je een terugbetaling.\n\nBestelde items kunnen helaas niet worden omgeruild voor een ander item. Wil je toch graag een ander item ontvangen, dan raden we je aan om jouw aankoop te retourneren. Wanneer je retour voldoet aan de retourvoorwaarden, zullen we overgaan tot terugbetaling van het aankoopbedrag. Je kunt voor het item dat je wilt ontvangen zelf een nieuwe bestelling plaatsen.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.retourneren.SALEItemsRetourneren": {
            "value": "SALE items retourneren",
            "message": "Wanneer de SALE artikelen voldoen aan onze retourvoorwaarden kan je deze retourneren. Zodra wij jouw retour hebben ontvangen en verwerkt zullen we overgaan tot terugbetaling van het aankoopbedrag.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bestellen": {
            "value": "bestellen",
            "message": "kies een onderwerp om meer informatie over te krijgen.",
            "quickAnswers": [
                "bestelling mislukt",
                "uitverkocht",
                "geen bevestigingsmail ontvangen",
                "bestelling na afloop wijzigen",
                "adresgegevens na afloop wijzigen",
                "reservering van winkelwagen items",
                "heb ik een account nodig?",
                "hoe plaats ik een bestelling?",
                "nieuwsbrief",
                "garantietermijn",
                "garantievoorwaarden"
            ],
            "externalLinks": []
        },
        "start.bestellen.bestellingMislukt": {
            "value": "bestelling mislukt",
            "message": "Dit kan verschillende oorzaken hebben. Wij raden je aan om je adres handmatig in te vullen in de checkout. Mocht het hierna nog niet lukken, dan raden wij je aan om contact op te nemen met onze Customer Care. Het is handig om hierbij een screenshot te sturen van de gehele checkout of de foutmelding.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Customer care",
                    "url": "/"
                }
            ]
        },
        "start.bestellen.uitverkocht": {
            "value": "uitverkocht",
            "message": "We doen ons best om uitverkochte items zo snel mogelijk aan te vullen. Je kan je e-mailadres invoeren door op het envelopje naast de gewenste maat te klikken. Zo blijf je op de hoogte zodra dit product weer leverbaar is.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bestellen.geenBevestigingsmailOntvangen": {
            "value": "geen bevestigingsmail ontvangen",
            "message": "Het kan voorkomen dat je misschien in alle haast een foutje hebt gemaakt bij het invoeren van je e-mailadres of dat de bevestigings e-mail in je spam terecht is gekomen.\n\nNadat je een order geplaatst hebt wordt je doorverwezen naar de bevestigingspagina. In dit geval kan je er zeker van zijn dat je bestelling goed is doorgekomen en wij je bestelling momenteel aan het inpakken zijn. \n\nMocht je niet worden doorverwezen naar de bevestigingspagina dan raden wij je aan om contact op te nemen met onze Customer Care. Het is hierbij handig om een screenshot mee te sturen van je bankafschrift of bevestigingspagina zodat onze Customer Care jou beter kan helpen.",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Customer care",
                    "url": "/"
                }
            ]
        },
        "start.bestellen.bestellingNaAfloopWijzigen": {
            "value": "bestelling na afloop wijzigen",
            "message": "Nadat je jouw bestelling hebt afgerond, wordt deze zo snel mogelijk gereed gemaakt voor verzending. Aangezien je bestelling al te ver in het verzendproces zit, is het helaas niet meer mogelijk om je bestelling te wijzigen of annuleren. Indien je nog een ander artikel wenst te ontvangen, raden wij je aan om een nieuwe bestelling te plaatsen. Indien je je bestelling niet meer wenst te ontvangen, raden wij je aan om de bestelling te retourneren.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bestellen.adresgegevensNaAfloopWijzigen": {
            "value": "adresgegevens na afloop wijzigen",
            "message": "Nadat je jouw bestelling volledig hebt afgerond, wordt deze zo snel mogelijk gereed gemaakt voor verzending. Aangezien je bestelling al te ver in het verzendproces zit, is het helaas niet meer mogelijk om het afleveradres te wijzigen. Als je bestelling wordt afgeleverd op het door jou opgegeven adres, zal je zelf je bestelling af moeten halen. Mocht het niet lukken om je bestelling op het opgegeven adres te leveren dan zal je een bericht van DHL (Nederland) of Bpost (België) ontvangen met verdere bezorg instructies.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bestellen.reserveringVanWinkelwagenItems": {
            "value": "reservering van winkelwagen items",
            "message": "Items in je winkelwagen en of verlanglijstje worden niet gereserveerd. Daarnaast is het niet mogelijk om items te reserveren.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bestellen.hebIkEenAccountNodig?": {
            "value": "heb ik een account nodig?",
            "message": "Je hebt geen account nodig om te bestellen. Wel adviseren wij je om een LOAVIES account aan te maken als je iets wilt bestellen. In je account kan je je gegevens opslaan zodat dit automatisch in de checkout staat. Daarnaast heb je een handig overzicht van je bestelgeschiedenis. Je kan ook items opslaan in jouw verlanglijstje.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bestellen.hoePlaatsIkEenBestelling?": {
            "value": "hoe plaats ik een bestelling?",
            "message": "Shop jouw favoriete artikelen op onze webshop. Kies je maat en voeg de item(s) toe aan je winkelwagen. Heb je alles gevonden wat je wilt hebben? Ga dan naar je winkelwagen en controleer of de maten en aantallen kloppen. Is alles correct? Klik dan op ''Ik ga bestellen''.\n\nBij het afrekenen kun je je persoonlijke gegevens invullen. Als je al een account hebt en bent ingelogd dan worden deze gegevens automatisch ingevuld. Controleer deze gegevens wel voordat je verder gaat naar de verzendmethode.\n\nBij de verzendmethode kun je ervoor kiezen om je bestelling thuis te laten bezorgen. In Nederland is het ook mogelijk om je pakket bij een DHL servicepunt te laten bezorgen.\n\nAls laatste kies je de betaalmethode en rond je de bestelling af. Na het afronden van je bestelling ontvang je een bevestiging op het doorgegeven e-mailadres.",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bestellen.nieuwsbrief": {
            "value": "nieuwsbrief",
            "message": "Als je bent ingelogd in de webshop heb je de mogelijkheid om je aan te melden voor onze nieuwsbrieven. In je account menu kan je bij nieuwsbrieven je voorkeur aangeven. Als je niet bent ingelogd in onze webshop kan je onderaan de webshop bij ''Join onze #girlsgoneloavies squad'' je e-mailadres invoeren om de nieuwsbrieven te ontvangen. Wees de eerste die hoort over onze nieuwe collectie, cute lookbooks, sales, kortingen en meer!",
            "quickAnswers": [],
            "externalLinks": []
        },
        "start.bestellen.garantietermijn": {
            "value": "garantietermijn",
            "message": "Voor alle artikelen geldt een garantietermijn van 60 dagen. Mocht een artikel binnen deze periode beschadigd zijn neem dan direct contact op met onze Customer Care. Vergeet niet om een foto van de klacht mee te sturen. Onze Customer Care neemt je bericht zo snel mogelijk in behandeling en zoekt samen met jou naar de beste oplossing!",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Customer care",
                    "url": "/"
                }
            ]
        },
        "start.bestellen.garantievoorwaarden": {
            "value": "garantievoorwaarden",
            "message": "De garantie is alleen geldig binnen de garantietermijn en wanneer er sprake is van een gegronde klacht. In de volgende gevallen is er geen sprake van een gegronde klacht:\n\n&#8226;Verkeerd gebruik of nalatig onderhoud&#8226;Opzettelijke of door nalatigheid ontstane beschadiging. Bijvoorbeeld water-, val- en/of stootschade&#8226;Beschadiging door het niet aanhouden van de wasinstructies&#8226;Uitzonderlijke slijtage",
            "quickAnswers": [],
            "externalLinks": [
                {
                    "value": "Algemene voorwaarden",
                    "url": "https://www.loavies.com/nl/content/algemene-voorwaarden"
                }
            ]
        },
        "start.overig": {
            "value": "overig",
            "message": "stel je vraag, dan probeer ik deze te beantwoorden!",
            "quickAnswers": [],
            "externalLinks": []
        }
    }

    try {

        // create Google API token
        const token = await new Promise((resolve, reject) => jwt.authorize(async (error, tokens) => {
            if (error) {
                reject(new Error('Error making request to generate token'))
            } else if (!tokens.access_token) {
                reject(new Error('Provided service account doest not have permission to generate access tokens'))
            }
            resolve(tokens.access_token)
        }))

        if (!token) {
            return null;
        }

        // headers and token needed for firebase GET call 
        const headers = { Authorization: 'Bearer ' + token }

        // 1.   import het laatste nlp model.
        // Firebase GET call, destructured to data
        const { data: trainingHistory = data } = await axios.get(trainingHistoryUrl, { headers })
        // console.log(trainingHistory);

        const trainingData = Object.values(trainingHistory).map(data => data.trainingData)
        // console.log(trainingData);

        // NLP manager
        const dock = await dockStart({ use: ['Basic'], autoSave: false, modelFileName: '/tmp/model.nlp' });
        const nlp = dock.get('nlp');

        // // nlp.import();
        nlp.load('/tmp/model.nlp')

        // // // Setup NLP

        nlp.addLanguage('nl');

        // // 2.   ontvang nieuwe input voor het model. (vragen en antwoorden)

        const chatbotAnswerFallBack = []

        trainingData.forEach(chatbotOrUser => {
            if (!chatbotOrUser) return
            for (const [key, value] of Object.entries(chatbotOrUser)) {
                value.forEach(input => {
                    if (!input) return
                    const { language, intent, utterance } = input
                    const chatbotOutput = key === 'chatbotReactionTrainingForm'

                    // 3.2  Zo nee, train model
                    if (chatbotOutput) {
                        chatbotAnswerFallBack.push({ language, intent, utterance })
                        nlp.addAnswer(language, intent, utterance);
                    }
                    else {
                        nlp.addDocument(language, utterance, intent);
                    }
                });
            }
        })

        try {
            await nlp.train()
        } catch (error) {
            console.log(error);
        }


        if (receivedMessage === 'start') {
            const data = fakeData.start

            return {
                statusCode: 200,
                body: JSON.stringify({
                    'result': data,
                    'statusCode': 200
                }
                )
            }
        }


        if (receivedQuickAnswer && receivedMessage !== 'start') {
            console.log('if');
            // console.log(receivedQuickAnswer);
            const allValues = Object.values(fakeData)

            const currentValueFinder = entry => entry.value === receivedQuickAnswer

            const currentValue = allValues.find(currentValueFinder)

            if (currentValue) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        'result': currentValue,
                        'statusCode': 200
                    }
                    )
                }
            }
        }

        // nlp.export('./model.nlp')
        const result = await nlp.process('nl', receivedMessage)
        const { intent, answers } = result

        if (!answers.length && intent !== 'None') {
            const fallbackAnswer = chatbotAnswerFallBack.find(value => {
                if (value.intent === intent) return value
            })

            // const fallbackAnswer = chatbotAnswerFallBack.find(({ intent }) => intent === intent)
            if (fallbackAnswer) answers.push(fallbackAnswer.utterance)
        }

        if (intent === 'None') answers.push('Ik ben niet goed genoeg getrained om deze vraag te beantwoorden...')
        console.log({ 'result': { intent, answers }, 'statusCode': 200 });
        return {
            statusCode: 200,
            body: JSON.stringify({ 'result': { intent, answers }, 'statusCode': 200 })
        }
    }
    catch (e) {
        // throw new Error('Error fetching Google Analytics data')
        return {
            statusCode: 500,
            body: e.message
        }
    }
};