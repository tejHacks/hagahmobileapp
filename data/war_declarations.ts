export type BattleCard = {
  title: string;
  icon: string;
  verse: string;
  scripture: string;
  declaration: (name: string) => string;
};

export const battleCards: BattleCard[] = [
  // ─── ORIGINAL 12 ──────────────────────────────────────────────────────────
  {
    title: "Fear",
    icon: "shield-checkmark",
    verse: "2 Timothy 1:7",
    scripture:
      "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
    declaration: (n) =>
      `I, ${n}, refuse to bow to fear. God has not given me a spirit of fear — He has given me power, love, and a sound mind. Fear has no authority over my life today.`,
  },
  {
    title: "Lust",
    icon: "flame",
    verse: "1 Corinthians 6:18–20",
    scripture:
      "Flee fornication. Every sin that a man doeth is without the body; but he that committeth fornication sinneth against his own body. What? know ye not that your body is the temple of the Holy Ghost which is in you, which ye have of God, and ye are not your own? For ye are bought with a price: therefore glorify God in your body, and in your spirit, which are God's.",
    declaration: (n) =>
      `I, ${n}, declare that my body is the temple of the Holy Ghost. I am not my own — I was bought with the blood of Jesus. I flee every form of sexual sin and walk in purity because the Spirit of God lives in me.`,
  },
  {
    title: "Anxiety",
    icon: "leaf",
    verse: "Philippians 4:6–7",
    scripture:
      "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
    declaration: (n) =>
      `I, ${n}, cast every anxious thought at the feet of Jesus. I am careful for nothing. I bring everything to God in prayer and thanksgiving, and His peace — which passes all understanding — guards my heart and mind right now.`,
  },
  {
    title: "Doubt",
    icon: "compass",
    verse: "Mark 11:23–24",
    scripture:
      "For verily I say unto you, That whosoever shall say unto this mountain, Be thou removed, and be thou cast into the sea; and shall not doubt in his heart, but shall believe that those things which he saith shall come to pass; he shall have whatsoever he saith. Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.",
    declaration: (n) =>
      `I, ${n}, choose to believe and not doubt. I speak to every mountain in my life and command it to move. I believe I receive what God has promised, and it shall come to pass in Jesus' name.`,
  },
  {
    title: "Confusion",
    icon: "bulb",
    verse: "James 1:5–6",
    scripture:
      "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him. But let him ask in faith, nothing wavering. For he that wavereth is like a wave of the sea driven with the wind and tossed.",
    declaration: (n) =>
      `I, ${n}, am not confused. I ask God for wisdom and He gives it to me liberally. I ask in faith without wavering. I have divine clarity, divine direction, and a made-up mind rooted in God's Word.`,
  },
  {
    title: "Depression",
    icon: "sunny",
    verse: "Psalm 34:18 & Psalm 30:5",
    scripture:
      "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit. For his anger endureth but a moment; in his favour is life: weeping may endure for a night, but joy cometh in the morning.",
    declaration: (n) =>
      `I, ${n}, declare that this heaviness is not my home. The Lord is close to my broken heart and He saves me. Weeping may endure for a night — but joy is coming in the morning. I choose hope. I choose God.`,
  },
  {
    title: "Addiction",
    icon: "lock-open",
    verse: "John 8:36 & Romans 6:14",
    scripture:
      "If the Son therefore shall make you free, ye shall be free indeed. For sin shall not have dominion over you: for ye are not under the law, but under grace.",
    declaration: (n) =>
      `I, ${n}, am free. The Son has set me free and I am free indeed. Sin has no dominion over me. I am not a slave to this habit, this substance, or this cycle. I walk in freedom by the grace of Jesus Christ today.`,
  },
  {
    title: "Unforgiveness",
    icon: "heart",
    verse: "Mark 11:25–26",
    scripture:
      "And when ye stand praying, forgive, if ye have ought against any: that your Father also which is in heaven may forgive you your trespasses. But if ye do not forgive, neither will your Father which is in heaven forgive your trespasses.",
    declaration: (n) =>
      `I, ${n}, choose to forgive. I release every person who has wronged me into God's hands. I will not let bitterness poison my future. I am free from the prison of unforgiveness, and I receive God's full forgiveness over my own life.`,
  },
  {
    title: "Pride",
    icon: "trending-down",
    verse: "Proverbs 16:18 & James 4:6",
    scripture:
      "Pride goeth before destruction, and an haughty spirit before a fall. But he giveth more grace. Wherefore he saith, God resisteth the proud, but giveth grace unto the humble.",
    declaration: (n) =>
      `I, ${n}, humble myself before God. I refuse pride. I will not be exalted in my own eyes — I choose to walk humbly, knowing that God resists the proud and gives grace to the humble. His grace is enough for me.`,
  },
  {
    title: "Sickness",
    icon: "medkit",
    verse: "Isaiah 53:5 & 1 Peter 2:24",
    scripture:
      "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed. Who his own self bare our sins in his own body on the tree, that we, being dead to sins, should live unto righteousness: by whose stripes ye were healed.",
    declaration: (n) =>
      `I, ${n}, declare that by the stripes of Jesus I am healed. Sickness has no legal right to live in this body. Jesus bore every infirmity on that cross. I receive my healing now, in Jesus' mighty name.`,
  },
  {
    title: "Delay",
    icon: "timer",
    verse: "Habakkuk 2:3 & Isaiah 40:31",
    scripture:
      "For the vision is yet for an appointed time, but at the end it shall speak, and not lie: though it tarry, wait for it; because it will surely come, it will not tarry. But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    declaration: (n) =>
      `I, ${n}, will not faint in the season of waiting. What God has spoken will come to pass at its appointed time. I wait on the Lord and my strength is renewed. I mount up with wings as eagles. The vision is not dead — it is on its way.`,
  },
  {
    title: "Strongholds",
    icon: "hammer",
    verse: "2 Corinthians 10:4–5",
    scripture:
      "For the weapons of our warfare are not carnal, but mighty through God to the pulling down of strong holds; Casting down imaginations, and every high thing that exalteth itself against the knowledge of God, and bringing into captivity every thought to the obedience of Christ.",
    declaration: (n) =>
      `I, ${n}, take up the weapons of my warfare. They are not carnal — they are mighty through God. I pull down every stronghold, cast down every imagination that rises against the knowledge of God, and bring every thought captive to the obedience of Christ.`,
  },

  // ─── NEW BATTLES ──────────────────────────────────────────────────────────
  {
    title: "Frustration",
    icon: "thunderstorm",
    verse: "Psalm 37:7–8",
    scripture:
      "Rest in the LORD, and wait patiently for him: fret not thyself because of him who prospereth in his way, because of the man who bringeth wicked devices to pass. Cease from anger, and forsake wrath: fret not thyself in any wise to do evil.",
    declaration: (n) =>
      `I, ${n}, lay down frustration at the feet of Jesus. I will not fret — I rest in the Lord and wait patiently for Him. My peace is not dictated by my circumstances; it is kept by the God who holds all things together.`,
  },
  {
    title: "Oppression",
    icon: "arrow-down-circle",
    verse: "Isaiah 54:14 & Psalm 72:14",
    scripture:
      "In righteousness shalt thou be established: thou shalt be far from oppression; for thou shalt not fear: and from terror; for it shall not come near thee. He shall redeem their soul from deceit and violence: and precious shall their blood be in his sight.",
    declaration: (n) =>
      `I, ${n}, am established in righteousness. Oppression has no right to stand over me — I am far from it by the covenant of God. Every yoke of oppression is broken now in the name of Jesus.`,
  },
  {
    title: "Manipulation",
    icon: "git-network",
    verse: "Proverbs 4:23 & Colossians 2:8",
    scripture:
      "Keep thy heart with all diligence; for out of it are the issues of life. Beware lest any man spoil you through philosophy and vain deceit, after the tradition of men, after the rudiments of the world, and not after Christ.",
    declaration: (n) =>
      `I, ${n}, guard my heart with all diligence. No man, no system, no spirit has the right to manipulate or control me. I am rooted in Christ — not in the traditions of men. Every deceptive influence over my mind is broken right now.`,
  },
  {
    title: "Spiritual Blindness",
    icon: "eye-off",
    verse: "Ephesians 1:17–18",
    scripture:
      "That the God of our Lord Jesus Christ, the Father of glory, may give unto you the spirit of wisdom and revelation in the knowledge of him: The eyes of your understanding being enlightened; that ye may know what is the hope of his calling, and what the riches of the glory of his inheritance in the saints.",
    declaration: (n) =>
      `I, ${n}, declare that my eyes are open. The spirit of wisdom and revelation rests upon me. I see clearly the hope of my calling, the truth of God's Word, and every strategy of the enemy that has been hidden from me. Darkness is dispelled. I see.`,
  },
  {
    title: "Spiritual Dullness",
    icon: "battery-dead",
    verse: "Romans 12:11 & Hebrews 6:12",
    scripture:
      "Not slothful in business; fervent in spirit; serving the Lord. That ye be not slothful, but followers of them who through faith and patience inherit the promises.",
    declaration: (n) =>
      `I, ${n}, shake off every spiritual dullness and slumber. I am fervent in spirit — on fire for God. I follow those who through faith and patience inherit the promises. My spirit is awake, my hunger for God is real, and I press into His presence now.`,
  },
  {
    title: "Greed",
    icon: "cash",
    verse: "Luke 12:15 & Hebrews 13:5",
    scripture:
      "And he said unto them, Take heed, and beware of covetousness: for a man's life consisteth not in the abundance of the things which he possesseth. Let your conversation be without covetousness; and be content with such things as ye have: for he hath said, I will never leave thee, nor forsake thee.",
    declaration: (n) =>
      `I, ${n}, am free from the spirit of greed. My life is not defined by what I possess. I am content, because God Himself has said He will never leave me nor forsake me. He is my portion, and He is enough.`,
  },
  {
    title: "Gluttony",
    icon: "fast-food",
    verse: "1 Corinthians 9:27 & Proverbs 23:20–21",
    scripture:
      "But I keep under my body, and bring it into subjection: lest that by any means, when I have preached to others, I myself should be a castaway. Be not among winebibbers; among riotous eaters of flesh: For the drunkard and the glutton shall come to poverty: and drowsiness shall clothe a man with rags.",
    declaration: (n) =>
      `I, ${n}, bring my body into subjection. I am not ruled by appetite — I rule my appetite. My body is a servant of the Spirit of God, not a master over me. I exercise self-control in all things for the glory of God.`,
  },
  {
    title: "Hypocrisy",
    icon: "glasses",
    verse: "Matthew 23:27–28 & James 3:17",
    scripture:
      "Woe unto you, scribes and Pharisees, hypocrites! for ye are like unto whited sepulchres, which indeed appear beautiful outward, but are within full of dead men's bones, and of all uncleanness. Even so ye also outwardly appear righteous unto men, but within ye are full of hypocrisy and iniquity. But the wisdom that is from above is first pure, then peaceable, gentle, and easy to be intreated, full of mercy and good fruits, without partiality, and without hypocrisy.",
    declaration: (n) =>
      `I, ${n}, refuse to live a double life. I will not wear a mask before men while my heart is far from God. I choose authenticity, purity, and the wisdom that comes from above — peaceable, gentle, full of mercy, without hypocrisy.`,
  },
  {
    title: "Envy",
    icon: "eye",
    verse: "Proverbs 14:30 & James 3:14–16",
    scripture:
      "A sound heart is the life of the flesh: but envy the rottenness of the bones. But if ye have bitter envying and strife in your hearts, glory not, and lie not against the truth. This wisdom descendeth not from above, but is earthly, sensual, devilish. For where envying and strife is, there is confusion and every evil work.",
    declaration: (n) =>
      `I, ${n}, cast out every root of envy from my heart. Envy is the rottenness of bones — I will not let it destroy me from the inside. I rejoice with those who rejoice. My heart is sound, my mind is clear, and confusion has no place in me.`,
  },
  {
    title: "Jealousy",
    icon: "git-compare",
    verse: "Romans 13:13 & 1 Corinthians 13:4",
    scripture:
      "Let us walk honestly, as in the day; not in rioting and drunkenness, not in chambering and wantonness, not in strife and envying. Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.",
    declaration: (n) =>
      `I, ${n}, walk in love — and love envieth not. Jealousy has no ground in me. I am secure in who God made me to be. I do not compare my chapter to another man's ending. I celebrate others' victories as signs that God is also faithful to me.`,
  },
  {
    title: "Competition",
    icon: "podium",
    verse: "Galatians 5:26 & Philippians 2:3",
    scripture:
      "Let us not be desirous of vain glory, provoking one another, envying one another. Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than themselves.",
    declaration: (n) =>
      `I, ${n}, am not in competition with any man. God has a lane for me and no one can take what He has ordained for my life. I do nothing through strife or vainglory. I walk in humility, and I celebrate every person around me.`,
  },
  {
    title: "Self-Pleasing",
    icon: "person",
    verse: "Galatians 1:10 & Romans 15:1–3",
    scripture:
      "For do I now persuade men, or God? or do I seek to please men? for if I yet pleased men, I should not be the servant of Christ. We then that are strong ought to bear the infirmities of the weak, and not to please ourselves. For even Christ pleased not himself; but, as it is written, The reproaches of them that reproached thee fell on me.",
    declaration: (n) =>
      `I, ${n}, am a servant of Christ — not a slave to men's approval. I do not live to please myself or to please the crowd. I live to please God. Let every opinion of man that has held me captive be broken now. I walk in the freedom of knowing who I serve.`,
  },
  {
    title: "Low Self-Esteem",
    icon: "star",
    verse: "Psalm 139:14 & Ephesians 2:10",
    scripture:
      "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well. For we are his workmanship, created in Christ Jesus unto good works, which God hath before ordained that we should walk in them.",
    declaration: (n) =>
      `I, ${n}, am fearfully and wonderfully made. I am not a mistake. I am not lesser. I am God's workmanship — created in Christ Jesus for good works He prepared before I was even born. I walk in the identity God gave me, not the one the world assigned me.`,
  },
  {
    title: "Seductive Thoughts",
    icon: "warning",
    verse: "James 1:14–15 & 1 Corinthians 10:13",
    scripture:
      "But every man is tempted, when he is drawn away of his own lust, and enticed. Then when lust hath conceived, it bringeth forth sin: and sin, when it is finished, bringeth forth death. There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it.",
    declaration: (n) =>
      `I, ${n}, will not be drawn away by seductive or impure thoughts. God has provided a way of escape and I take it now. I bring every thought captive to the obedience of Christ. My mind is guarded by the Word of God and no seduction of the flesh or the enemy will find a home in me.`,
  },
  {
    title: "Heresies",
    icon: "alert-circle",
    verse: "2 Timothy 4:3–4 & Galatians 1:8",
    scripture:
      "For the time will come when they will not endure sound doctrine; but after their own lusts shall they heap to themselves teachers, having itching ears; And they shall turn away their ears from the truth, and shall be turned unto fables. But though we, or an angel from heaven, preach any other gospel unto you than that which we have preached unto you, let him be accursed.",
    declaration: (n) =>
      `I, ${n}, stand on the sound doctrine of the Word of God. I will not be turned by itching-ear theology, false teachers, or another gospel. I test every spirit. I hold to the truth that was once delivered to the saints. No heresy will shipwreck my faith.`,
  },
];