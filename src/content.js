// Data-driven starter lesson bank. Expand with reviewed CEFR-aligned content before public release.
const L = (id, german, prompts, options, explanations, xp=20) => ({
  id, npc: "Frau Marta", german,
  prompt: {id: prompts[0], en: prompts[1], de: prompts[2], es: prompts[3]},
  options: options.map((o, i) => ({
    id: `o${i+1}`,
    label: {id:o[0], en:o[1], de:o[2], es:o[3]},
    correct: i === 0
  })),
  explanation: {id: explanations[0], en: explanations[1], de: explanations[2], es: explanations[3]},
  xp
});

export const cefrLevels = [
  { id: "A1", title: "A1", description: "Beginner" },
  { id: "A2", title: "A2", description: "Elementary" },
  { id: "B1", title: "B1", description: "Intermediate" },
  { id: "B2", title: "B2", description: "Upper intermediate" },
  { id: "C1", title: "C1", description: "Advanced" },
  { id: "C2", title: "C2", description: "Proficient" }
];

export const lessons = {
  A1: [
    L("a1-greeting-01", "Guten Tag!", ["Apa arti “Guten Tag”?", "What does “Guten Tag” mean?", "Was bedeutet „Guten Tag“?", "¿Qué significa “Guten Tag”?"],
      [["Selamat siang / Halo","Good afternoon / Hello","Guten Tag","Buenas tardes / Hola"],["Selamat malam","Good night","Gute Nacht","Buenas noches"],["Sampai jumpa","See you","Auf Wiedersehen","Hasta luego"]],
      ["“Guten Tag” adalah salam sopan yang digunakan pada siang hari.","“Guten Tag” is a polite daytime greeting.","„Guten Tag“ ist eine höfliche Begrüßung am Tag.","“Guten Tag” es un saludo formal que se usa durante el día."],25),
    L("a1-name-02", "Ich heiße Anna.", ["Apa arti “Ich heiße Anna”?", "What does “Ich heiße Anna” mean?", "Was bedeutet „Ich heiße Anna“?", "¿Qué significa “Ich heiße Anna”?"],
      [["Nama saya Anna","My name is Anna","Ich heiße Anna","Me llamo Anna"],["Saya tinggal di Anna","I live in Anna","Ich wohne in Anna","Vivo en Anna"],["Saya suka Anna","I like Anna","Ich mag Anna","Me gusta Anna"]],
      ["“Ich heiße …” digunakan untuk memperkenalkan nama.","Use “Ich heiße …” to introduce your name.","„Ich heiße …“ verwendet man, um sich vorzustellen.","Usa “Ich heiße…” para decir tu nombre."]),
    L("a1-thanks-03", "Danke schön!", ["Bagaimana arti “Danke schön”?", "What does “Danke schön” mean?", "Was bedeutet „Danke schön“?", "¿Qué significa “Danke schön”?"],
      [["Terima kasih banyak","Thank you very much","Vielen Dank","Muchas gracias"],["Permisi","Excuse me","Entschuldigung","Perdón"],["Selamat datang","Welcome","Willkommen","Bienvenido"]],
      ["“Danke schön” adalah ungkapan terima kasih yang sopan.","“Danke schön” is a polite way to say thank you.","„Danke schön“ ist eine höfliche Dankesformel.","“Danke schön” es una forma cortés de dar las gracias."])
  ],
  A2: [
    L("a2-order-01", "Ich hätte gern einen Kaffee.", ["Apa yang diminta pembicara?", "What is the speaker ordering?", "Was bestellt die Person?", "¿Qué pide la persona?"],
      [["Kopi","A coffee","Einen Kaffee","Un café"],["Teh","Tea","Einen Tee","Un té"],["Air","Water","Wasser","Agua"]],
      ["“Ich hätte gern …” adalah cara sopan untuk memesan sesuatu.","“Ich hätte gern …” is a polite way to order something.","„Ich hätte gern …“ ist eine höfliche Bestellform.","“Ich hätte gern…” es una forma cortés de pedir algo."]),
    L("a2-direction-02", "Gehen Sie geradeaus.", ["Apa instruksi ini?", "What is this instruction?", "Was bedeutet diese Anweisung?", "¿Qué indica esta instrucción?"],
      [["Jalan lurus","Go straight ahead","Gehen Sie geradeaus","Siga recto"],["Belok kiri","Turn left","Biegen Sie links ab","Gire a la izquierda"],["Berhenti di sini","Stop here","Bleiben Sie hier stehen","Pare aquí"]],
      ["“Geradeaus” berarti lurus ke depan.","“Geradeaus” means straight ahead.","„Geradeaus“ bedeutet nach vorne, ohne abzubiegen.","“Geradeaus” significa seguir recto."]),
    L("a2-yesterday-03", "Gestern habe ich gearbeitet.", ["Kapan orang itu bekerja?", "When did the person work?", "Wann hat die Person gearbeitet?", "¿Cuándo trabajó esa persona?"],
      [["Kemarin","Yesterday","Gestern","Ayer"],["Besok","Tomorrow","Morgen","Mañana"],["Sekarang","Now","Jetzt","Ahora"]],
      ["“Gestern” berarti kemarin dan sering digunakan untuk waktu lampau.","“Gestern” means yesterday and refers to the past.","„Gestern“ bezeichnet den vergangenen Tag.","“Gestern” significa ayer y se refiere al pasado."])
  ],
  B1: [
    L("b1-opinion-01", "Meiner Meinung nach ist die Idee sinnvoll.", ["Apa yang diungkapkan kalimat ini?", "What does this sentence express?", "Was drückt dieser Satz aus?", "¿Qué expresa esta frase?"],
      [["Pendapat","An opinion","Eine Meinung","Una opinión"],["Larangan","A prohibition","Ein Verbot","Una prohibición"],["Permintaan maaf","An apology","Eine Entschuldigung","Una disculpa"]],
      ["“Meiner Meinung nach” berarti menurut pendapat saya.","“Meiner Meinung nach” means in my opinion.","„Meiner Meinung nach“ bedeutet aus meiner Sicht.","“Meiner Meinung nach” significa en mi opinión."]),
    L("b1-cause-02", "Ich blieb zu Hause, weil ich krank war.", ["Mengapa orang itu tinggal di rumah?", "Why did the person stay home?", "Warum blieb die Person zu Hause?", "¿Por qué se quedó en casa?"],
      [["Karena sedang sakit","Because they were ill","Weil die Person krank war","Porque estaba enferma"],["Karena sedang bekerja","Because they were working","Weil sie arbeitete","Porque estaba trabajando"],["Karena sedang berlibur","Because they were on holiday","Weil sie Urlaub hatte","Porque estaba de vacaciones"]],
      ["“Weil” memperkenalkan alasan atau sebab.","“Weil” introduces a reason or cause.","„Weil“ leitet einen Grund ein.","“Weil” introduce una razón o causa."]),
    L("b1-plan-03", "Wenn es morgen regnet, bleiben wir drinnen.", ["Dalam kondisi apa mereka akan tetap di dalam?", "Under what condition will they stay inside?", "Unter welcher Bedingung bleiben sie drinnen?", "¿En qué condición se quedarán dentro?"],
      [["Jika besok hujan","If it rains tomorrow","Wenn es morgen regnet","Si mañana llueve"],["Jika hari ini panas","If it is hot today","Wenn es heute heiß ist","Si hoy hace calor"],["Jika besok cerah","If it is sunny tomorrow","Wenn es morgen sonnig ist","Si mañana hace sol"]],
      ["“Wenn” digunakan untuk menyatakan kondisi.","“Wenn” is used to express a condition.","„Wenn“ drückt eine Bedingung aus.","“Wenn” se usa para expresar una condición."])
  ],
  B2: [
    L("b2-passive-01", "Der Vertrag wurde gestern unterschrieben.", ["Apa yang terjadi pada kontrak?", "What happened to the contract?", "Was geschah mit dem Vertrag?", "¿Qué ocurrió con el contrato?"],
      [["Kontrak ditandatangani","The contract was signed","Der Vertrag wurde unterschrieben","El contrato fue firmado"],["Kontrak dibatalkan","The contract was cancelled","Der Vertrag wurde storniert","El contrato fue cancelado"],["Kontrak hilang","The contract was lost","Der Vertrag ging verloren","El contrato se perdió"]],
      ["“Wurde … unterschrieben” adalah bentuk pasif lampau.","“Wurde … unterschrieben” is a past passive construction.","„Wurde … unterschrieben“ ist eine Passivform im Präteritum.","“Wurde … unterschrieben” es una construcción pasiva en pasado."]),
    L("b2-concession-02", "Obwohl es spät war, arbeitete sie weiter.", ["Apa hubungan kedua bagian kalimat?", "What is the relationship between the clauses?", "Wie hängen die Satzteile zusammen?", "¿Qué relación hay entre las cláusulas?"],
      [["Kontras atau konsesi","Contrast or concession","Gegensatz oder Einräumung","Contraste o concesión"],["Sebab dan akibat","Cause and effect","Ursache und Wirkung","Causa y efecto"],["Urutan waktu","Sequence in time","Zeitliche Reihenfolge","Secuencia temporal"]],
      ["“Obwohl” berarti meskipun dan menunjukkan kontras.","“Obwohl” means although and signals contrast.","„Obwohl“ drückt einen Gegensatz aus.","“Obwohl” significa aunque y expresa contraste."]),
    L("b2-formal-03", "Könnten Sie mir die Unterlagen zusenden?", ["Kalimat ini paling tepat digunakan untuk apa?", "What is this sentence best used for?", "Wofür eignet sich dieser Satz am besten?", "¿Para qué se usa mejor esta frase?"],
      [["Permintaan sopan","A polite request","Eine höfliche Bitte","Una petición cortés"],["Perintah keras","A harsh command","Ein strenger Befehl","Una orden tajante"],["Ucapan selamat","A congratulation","Ein Glückwunsch","Una felicitación"]],
      ["Bentuk “Könnten Sie …?” membuat permintaan lebih sopan dan formal.","“Könnten Sie …?” makes a request more polite and formal.","„Könnten Sie …?“ formuliert eine höfliche, formelle Bitte.","“Könnten Sie…?” formula una petición formal y cortés."])
  ],
  C1: [
    L("c1-nuance-01", "Das Vorhaben ist keineswegs unumstritten.", ["Apa makna “keineswegs unumstritten” dalam konteks ini?", "What does “keineswegs unumstritten” mean here?", "Was bedeutet „keineswegs unumstritten“ hier?", "¿Qué significa “keineswegs unumstritten” aquí?"],
      [["Sama sekali tidak bebas dari kontroversi","By no means uncontroversial","Keineswegs unumstritten","De ningún modo libre de controversia"],["Disetujui semua orang","Approved by everyone","Von allen gebilligt","Aprobado por todos"],["Belum pernah dibahas","Never discussed before","Noch nie besprochen","Nunca debatido"]],
      ["“Keineswegs” memperkuat negasi: sama sekali tidak.","“Keineswegs” emphatically means by no means or not at all.","„Keineswegs“ verstärkt die Verneinung.","“Keineswegs” refuerza la negación."]),
    L("c1-register-02", "Die Ergebnisse legen den Schluss nahe, dass weitere Daten nötig sind.", ["Apa fungsi “legen den Schluss nahe”?", "What does “legen den Schluss nahe” convey?", "Was bedeutet „legen den Schluss nahe“?", "¿Qué expresa “legen den Schluss nahe”?"],
      [["Menunjukkan kesimpulan yang masuk akal","Suggest a reasonable conclusion","Einen Schluss nahelegen","Apuntar a una conclusión razonable"],["Membantah semua bukti","Reject all evidence","Alle Beweise widerlegen","Refutar todas las pruebas"],["Mengubah topik","Change the topic","Das Thema wechseln","Cambiar de tema"]],
      ["Ungkapan ini digunakan dalam bahasa analitis untuk menyatakan inferensi.","This expression is used in analytical language to indicate an inference.","Die Wendung bezeichnet eine Schlussfolgerung aus Hinweisen.","La expresión indica una inferencia basada en indicios."]),
    L("c1-hedging-03", "Die Maßnahme dürfte kurzfristig Wirkung zeigen.", ["Apa nuansa kata “dürfte” di sini?", "What nuance does “dürfte” convey here?", "Welche Nuance hat „dürfte“ hier?", "¿Qué matiz aporta “dürfte” aquí?"],
      [["Perkiraan yang berhati-hati","A cautious expectation","Eine vorsichtige Einschätzung","Una previsión cautelosa"],["Kepastian mutlak","Absolute certainty","Absolute Gewissheit","Certeza absoluta"],["Larangan","A prohibition","Ein Verbot","Una prohibición"]],
      ["“Dürfte” dapat menandai dugaan atau perkiraan yang tidak mutlak.","“Dürfte” can mark a likely but not absolute expectation.","„Dürfte“ kann eine vorsichtige Vermutung ausdrücken.","“Dürfte” puede expresar una suposición probable, no absoluta."])
  ],
  C2: [
    L("c2-idiom-01", "Er nahm die Kritik gelassen hin.", ["Apa makna “etwas gelassen hinnehmen”?", "What does “etwas gelassen hinnehmen” mean?", "Was bedeutet „etwas gelassen hinnehmen“?", "¿Qué significa “etwas gelassen hinnehmen”?"],
      [["Menerima sesuatu dengan tenang","To accept something calmly","Etwas ruhig akzeptieren","Aceptar algo con calma"],["Membalas dengan marah","To respond angrily","Wütend reagieren","Responder con ira"],["Mengabaikan semua orang","To ignore everyone","Alle ignorieren","Ignorar a todos"]],
      ["“Gelassen hinnehmen” berarti menerima situasi tanpa bereaksi berlebihan.","“Gelassen hinnehmen” means to accept something calmly.","„Gelassen hinnehmen“ bedeutet, etwas ruhig zu akzeptieren.","“Gelassen hinnehmen” significa aceptar algo con serenidad."]),
    L("c2-rhetoric-02", "Die Argumentation ist schlüssig, wenngleich nicht frei von Widersprüchen.", ["Apa fungsi “wenngleich”?", "What is the function of “wenngleich”?", "Welche Funktion hat „wenngleich“?", "¿Qué función tiene “wenngleich”?"],
      [["Memperkenalkan konsesi: meskipun","Introducing a concession: although","Eine Einräumung einleiten: obwohl","Introducir una concesión: aunque"],["Menunjukkan tujuan","Showing purpose","Einen Zweck anzeigen","Indicar finalidad"],["Menunjukkan urutan","Showing sequence","Eine Reihenfolge anzeigen","Indicar secuencia"]],
      ["“Wenngleich” adalah penghubung formal yang berarti meskipun.","“Wenngleich” is a formal conjunction meaning although.","„Wenngleich“ ist eine formelle Konjunktion mit der Bedeutung „obwohl“.","“Wenngleich” es una conjunción formal que significa aunque."]),
    L("c2-register-03", "Seine Antwort war von bemerkenswerter Zurückhaltung geprägt.", ["Apa yang disiratkan “Zurückhaltung” dalam kalimat ini?", "What does “Zurückhaltung” suggest here?", "Was deutet „Zurückhaltung“ hier an?", "¿Qué sugiere “Zurückhaltung” aquí?"],
      [["Sikap menahan diri atau tidak berlebihan","Restraint or reserve","Zurückhaltung oder Reserviertheit","Contención o reserva"],["Kemarahan terbuka","Open anger","Offene Wut","Ira abierta"],["Kebingungan total","Complete confusion","Völlige Verwirrung","Confusión total"]],
      ["“Zurückhaltung” dapat berarti sikap terkendali, hati-hati, atau tidak berlebihan.","“Zurückhaltung” can mean restraint, reserve, or moderation.","„Zurückhaltung“ bezeichnet ein zurückhaltendes, maßvolles Verhalten.","“Zurückhaltung” puede significar reserva o moderación."])
  ]
};

export function getLevelForXP(xp) {
  if (xp >= 300) return "C2";
  if (xp >= 240) return "C1";
  if (xp >= 180) return "B2";
  if (xp >= 120) return "B1";
  if (xp >= 60) return "A2";
  return "A1";
}
