export type BattleScripture = {
  reference: string;
  translation: "KJV";
  /** Optional KJV text for the reference. Prefer loading from the local bible DB where possible. */
  text?: string;
};

export type BattleCard = {
  title: string;
  icon: string;

  /**
   * Primary Scripture shown at the top of the battle.
   */
  verse: string;

  /**
   * Kept temporarily for compatibility with the current WarScreen.
   * The next WarScreen revision should load the actual KJV text
   * from the Bible database instead of duplicating Scripture here.
   */
  scripture: string;

  /**
   * Five Scripture references that directly address the battle.
   * All are KJV references and should be resolved through the
   * app's local KJV Bible database.
   */
  scriptures: BattleScripture[];

  declaration: (name: string) => string;

  /** Short one-line description of the battle */
  description?: string;

  /** Practical numbered steps for how to fight this battle */
  howToFight?: string[];

  /** Short guided prayer prompt for this battle */
  prayer?: string;

  /** Fasting guidance (short and theologically responsible) */
  fasting?: string;

  /** Heart-check / repentance prompt where appropriate */
  repentance?: string;

  /** Key used to look up recommended books in booksByIssue */
  recommendedReadingKey?: string;

  /** Optional placeholder for audio/teaching category */
  audioCategory?: string | null;
};

const kjv = (references: string[]): BattleScripture[] =>
  references.map((reference) => ({
    reference,
    translation: "KJV",
  }));

export const battleCards: BattleCard[] = [
  // =========================================================================
  // FEAR
  // =========================================================================

  {
    title: "Fear",
    icon: "shield-checkmark",
    verse: "2 Timothy 1:7",
    scripture:
      "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",

    scriptures: kjv([
      "2 Timothy 1:7",
      "Psalm 27:1",
      "Isaiah 41:10",
      "Joshua 1:9",
      "Psalm 56:3",
    ]),

    declaration: (n) =>
      `I, ${n}, refuse to bow to fear. God has not given me a spirit of fear — He has given me power, love, and a sound mind. I will trust the Lord, stand in His Word, and refuse to be ruled by fear.`,
  },

  // =========================================================================
  // LUST
  // =========================================================================

  {
    title: "Lust",
    icon: "flame",
    verse: "1 Corinthians 6:18–20",
    scripture:
      "Flee fornication. Every sin that a man doeth is without the body; but he that committeth fornication sinneth against his own body.",

    scriptures: kjv([
      "1 Corinthians 6:18–20",
      "2 Timothy 2:22",
      "1 Thessalonians 4:3–5",
      "Job 31:1",
      "1 Corinthians 10:13",
    ]),

    declaration: (n) =>
      `I, ${n}, flee sexual sin and walk in purity. My body is the temple of the Holy Ghost. I belong to Christ, and I choose holiness over temporary pleasure.`,
  },

  // =========================================================================
  // ANXIETY
  // =========================================================================

  {
    title: "Anxiety",
    icon: "leaf",
    verse: "Philippians 4:6–7",
    scripture:
      "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",

    scriptures: kjv([
      "Philippians 4:6–7",
      "1 Peter 5:7",
      "Matthew 6:25–34",
      "Psalm 55:22",
      "Isaiah 26:3",
    ]),

    declaration: (n) =>
      `I, ${n}, bring my cares before God in prayer and thanksgiving. I will not be ruled by anxiety. I trust the Lord with what I cannot control, and I receive His peace as I wait upon Him.`,
  },

  // =========================================================================
  // DOUBT
  // =========================================================================

  {
    title: "Doubt",
    icon: "compass",
    verse: "Mark 11:23–24",
    scripture:
      "For verily I say unto you, That whosoever shall say unto this mountain, Be thou removed, and be thou cast into the sea; and shall not doubt in his heart.",

    scriptures: kjv([
      "Mark 11:23–24",
      "James 1:5–6",
      "Hebrews 11:1",
      "Hebrews 11:6",
      "Romans 10:17",
    ]),

    declaration: (n) =>
      `I, ${n}, choose faith over doubt. I will trust God, hear His Word, and continue believing what He has spoken. I refuse double-mindedness and choose steadfast faith.`,
  },

  // =========================================================================
  // CONFUSION
  // =========================================================================

  {
    title: "Confusion",
    icon: "bulb",
    verse: "James 1:5–6",
    scripture:
      "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",

    scriptures: kjv([
      "James 1:5–6",
      "Proverbs 3:5–6",
      "Psalm 119:105",
      "Isaiah 30:21",
      "1 Corinthians 14:33",
    ]),

    declaration: (n) =>
      `I, ${n}, seek God for wisdom and direction. I will not be driven by confusion. I trust the Lord with all my heart, and I submit my decisions to His Word.`,
  },

  // =========================================================================
  // DEPRESSION
  // =========================================================================

  {
    title: "Depression",
    icon: "sunny",
    verse: "Psalm 34:18",
    scripture:
      "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",

    scriptures: kjv([
      "Psalm 34:18",
      "Psalm 42:11",
      "Psalm 30:5",
      "Isaiah 41:10",
      "Romans 15:13",
    ]),

    declaration: (n) =>
      `I, ${n}, will seek the Lord in the midst of heaviness. God is near to the brokenhearted. I will not surrender my hope, and I will continue to seek Him day by day.`,
  },

  // =========================================================================
  // ADDICTION
  // =========================================================================

  {
    title: "Addiction",
    icon: "lock-open",
    verse: "John 8:36",
    scripture:
      "If the Son therefore shall make you free, ye shall be free indeed.",

    scriptures: kjv([
      "John 8:36",
      "Romans 6:14",
      "1 Corinthians 10:13",
      "Galatians 5:1",
      "2 Corinthians 3:17",
    ]),

    declaration: (n) =>
      `I, ${n}, seek the freedom Christ gives. I refuse to identify myself by a sinful habit. I will bring this struggle before God, flee temptation, and walk in obedience one day at a time.`,
  },

  // =========================================================================
  // UNFORGIVENESS
  // =========================================================================

  {
    title: "Unforgiveness",
    icon: "heart",
    verse: "Mark 11:25",
    scripture:
      "And when ye stand praying, forgive, if ye have ought against any.",

    scriptures: kjv([
      "Mark 11:25",
      "Ephesians 4:31–32",
      "Colossians 3:12–13",
      "Matthew 6:14–15",
      "Luke 6:27–28",
    ]),

    declaration: (n) =>
      `I, ${n}, choose forgiveness. I surrender bitterness, resentment, and vengeance to God. I will forgive as Christ has forgiven me, and I will refuse to let yesterday rule my heart.`,
  },

  // =========================================================================
  // PRIDE
  // =========================================================================

  {
    title: "Pride",
    icon: "trending-down",
    verse: "Proverbs 16:18",
    scripture:
      "Pride goeth before destruction, and an haughty spirit before a fall.",

    scriptures: kjv([
      "Proverbs 16:18",
      "James 4:6",
      "1 Peter 5:5–6",
      "Philippians 2:3–4",
      "Proverbs 11:2",
    ]),

    declaration: (n) =>
      `I, ${n}, humble myself before God. I refuse self-exaltation. I choose to serve, listen, learn, repent, and walk humbly with my God.`,
  },

  // =========================================================================
  // SICKNESS
  // =========================================================================

  {
    title: "Sickness",
    icon: "medkit",
    verse: "Isaiah 53:5",
    scripture:
      "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",

    scriptures: kjv([
      "Isaiah 53:5",
      "Psalm 103:2–3",
      "James 5:14–16",
      "Jeremiah 17:14",
      "Psalm 41:3",
    ]),

    declaration: (n) =>
      `I, ${n}, bring my body, my fears, and my sickness before the Lord. I trust God for mercy, healing, wisdom, and strength, and I will seek Him faithfully through this battle.`,
  },

  // =========================================================================
  // DELAY
  // =========================================================================

  {
    title: "Delay",
    icon: "timer",
    verse: "Habakkuk 2:3",
    scripture:
      "For the vision is yet for an appointed time, but at the end it shall speak, and not lie: though it tarry, wait for it.",

    scriptures: kjv([
      "Habakkuk 2:3",
      "Isaiah 40:31",
      "Psalm 27:14",
      "Galatians 6:9",
      "Hebrews 10:35–36",
    ]),

    declaration: (n) =>
      `I, ${n}, will not faint while I wait upon the Lord. I will remain faithful, keep obeying, keep praying, and keep trusting God in the appointed season.`,
  },

  // =========================================================================
  // STRONGHOLDS
  // =========================================================================

  {
    title: "Strongholds",
    icon: "hammer",
    verse: "2 Corinthians 10:4–5",
    scripture:
      "For the weapons of our warfare are not carnal, but mighty through God to the pulling down of strong holds.",

    scriptures: kjv([
      "2 Corinthians 10:4–5",
      "Ephesians 6:10–18",
      "Romans 12:2",
      "James 4:7",
      "1 John 4:4",
    ]),

    declaration: (n) =>
      `I, ${n}, bring every thought and pattern that opposes God under the authority of Christ. I will renew my mind through the Word, resist the devil, and submit myself to God.`,
  },

  // =========================================================================
  // FRUSTRATION
  // =========================================================================

  {
    title: "Frustration",
    icon: "thunderstorm",
    verse: "Psalm 37:7–8",
    scripture:
      "Rest in the LORD, and wait patiently for him: fret not thyself because of him who prospereth in his way.",

    scriptures: kjv([
      "Psalm 37:7–8",
      "Proverbs 14:29",
      "James 1:19–20",
      "Philippians 4:11–13",
      "Psalm 46:10",
    ]),

    declaration: (n) =>
      `I, ${n}, will not be ruled by frustration. I will slow down, seek God, guard my words, and trust Him with what I cannot control.`,
  },

  // =========================================================================
  // OPPRESSION
  // =========================================================================

  {
    title: "Oppression",
    icon: "arrow-down-circle",
    verse: "Isaiah 54:14",
    scripture:
      "In righteousness shalt thou be established: thou shalt be far from oppression; for thou shalt not fear.",

    scriptures: kjv([
      "Isaiah 54:14",
      "Psalm 34:17",
      "Psalm 72:12–14",
      "Isaiah 58:6",
      "2 Corinthians 3:17",
    ]),

    declaration: (n) =>
      `I, ${n}, seek the Lord for freedom and refuge. I refuse to surrender my heart to fear. I will remain established in righteousness and bring oppression before God in prayer.`,
  },

  // =========================================================================
  // MANIPULATION
  // =========================================================================

  {
    title: "Manipulation",
    icon: "git-network",
    verse: "Proverbs 4:23",
    scripture:
      "Keep thy heart with all diligence; for out of it are the issues of life.",

    scriptures: kjv([
      "Proverbs 4:23",
      "Colossians 2:8",
      "Galatians 1:10",
      "Proverbs 29:25",
      "Ephesians 4:14",
    ]),

    declaration: (n) =>
      `I, ${n}, will guard my heart and submit my thinking to Christ. I will not be controlled by fear of man, deception, or pressure. I will walk in truth and wisdom.`,
  },

  // =========================================================================
  // SPIRITUAL BLINDNESS
  // =========================================================================

  {
    title: "Spiritual Blindness",
    icon: "eye-off",
    verse: "Ephesians 1:17–18",
    scripture:
      "That the God of our Lord Jesus Christ, the Father of glory, may give unto you the spirit of wisdom and revelation in the knowledge of him.",

    scriptures: kjv([
      "Ephesians 1:17–18",
      "Psalm 119:18",
      "2 Corinthians 4:6",
      "John 16:13",
      "Proverbs 2:3–6",
    ]),

    declaration: (n) =>
      `I, ${n}, ask God for wisdom and revelation. I desire to know Him, understand His Word, and walk in the light He gives me. I will not cling to darkness when God offers truth.`,
  },

  // =========================================================================
  // SPIRITUAL DULLNESS
  // =========================================================================

  {
    title: "Spiritual Dullness",
    icon: "battery-dead",
    verse: "Romans 12:11",
    scripture:
      "Not slothful in business; fervent in spirit; serving the Lord.",

    scriptures: kjv([
      "Romans 12:11",
      "Hebrews 6:12",
      "Revelation 2:4–5",
      "Psalm 63:1",
      "Matthew 5:6",
    ]),

    declaration: (n) =>
      `I, ${n}, will not remain spiritually asleep. I hunger for God, return to His Word, seek His presence, and serve Him with renewed devotion.`,
  },

  // =========================================================================
  // GREED
  // =========================================================================

  {
    title: "Greed",
    icon: "cash",
    verse: "Luke 12:15",
    scripture:
      "Take heed, and beware of covetousness: for a man's life consisteth not in the abundance of the things which he possesseth.",

    scriptures: kjv([
      "Luke 12:15",
      "Hebrews 13:5",
      "1 Timothy 6:6–10",
      "Matthew 6:19–21",
      "Proverbs 11:24–25",
    ]),

    declaration: (n) =>
      `I, ${n}, will not measure my life by possessions. I choose contentment, generosity, stewardship, and gratitude. God Himself is my portion.`,
  },

  // =========================================================================
  // GLUTTONY
  // =========================================================================

  {
    title: "Gluttony",
    icon: "fast-food",
    verse: "1 Corinthians 9:27",
    scripture:
      "But I keep under my body, and bring it into subjection.",

    scriptures: kjv([
      "1 Corinthians 9:27",
      "Proverbs 23:20–21",
      "Philippians 3:18–19",
      "Galatians 5:22–23",
      "1 Corinthians 10:31",
    ]),

    declaration: (n) =>
      `I, ${n}, will not be ruled by appetite. I seek self-control and wise stewardship of my body, remembering that my life and my body belong to God.`,
  },

  // =========================================================================
  // HYPOCRISY
  // =========================================================================

  {
    title: "Hypocrisy",
    icon: "glasses",
    verse: "Matthew 23:27–28",
    scripture:
      "Even so ye also outwardly appear righteous unto men, but within ye are full of hypocrisy and iniquity.",

    scriptures: kjv([
      "Matthew 23:27–28",
      "James 3:17",
      "Psalm 139:23–24",
      "1 Samuel 16:7",
      "Luke 6:45",
    ]),

    declaration: (n) =>
      `I, ${n}, ask God to search my heart. I refuse to live for appearance while neglecting obedience. I desire truth in my inward parts and integrity before God and man.`,
  },

  // =========================================================================
  // ENVY
  // =========================================================================

  {
    title: "Envy",
    icon: "eye",
    verse: "Proverbs 14:30",
    scripture:
      "A sound heart is the life of the flesh: but envy the rottenness of the bones.",

    scriptures: kjv([
      "Proverbs 14:30",
      "James 3:14–16",
      "Galatians 5:26",
      "Romans 12:15",
      "1 Corinthians 13:4",
    ]),

    declaration: (n) =>
      `I, ${n}, refuse envy and comparison. I will rejoice with those who rejoice, honour others, and trust God with my own assignment and season.`,
  },

  // =========================================================================
  // JEALOUSY
  // =========================================================================

  {
    title: "Jealousy",
    icon: "git-compare",
    verse: "1 Corinthians 13:4",
    scripture:
      "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.",

    scriptures: kjv([
      "1 Corinthians 13:4–7",
      "Romans 12:15",
      "Galatians 5:22–23",
      "James 3:16",
      "Proverbs 14:30",
    ]),

    declaration: (n) =>
      `I, ${n}, choose love over comparison. I will not envy another person's progress. I will bless, celebrate, and trust God with my own path.`,
  },

  // =========================================================================
  // COMPETITION
  // =========================================================================

  {
    title: "Competition",
    icon: "podium",
    verse: "Philippians 2:3",
    scripture:
      "Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than themselves.",

    scriptures: kjv([
      "Philippians 2:3–4",
      "Galatians 5:26",
      "Romans 12:3",
      "1 Corinthians 3:5–7",
      "1 Peter 5:5–6",
    ]),

    declaration: (n) =>
      `I, ${n}, do not need to outshine another person to fulfil God's purpose for my life. I walk in humility, serve faithfully, and honour what God is doing in others.`,
  },

  // =========================================================================
  // SELF-PLEASING
  // =========================================================================

  {
    title: "Self-Pleasing",
    icon: "person",
    verse: "Galatians 1:10",
    scripture:
      "For do I now persuade men, or God? or do I seek to please men? for if I yet pleased men, I should not be the servant of Christ.",

    scriptures: kjv([
      "Galatians 1:10",
      "Romans 15:1–3",
      "Colossians 3:23–24",
      "John 12:43",
      "1 Thessalonians 2:4",
    ]),

    declaration: (n) =>
      `I, ${n}, live to please God. I will not make approval, comfort, or personal desire my master. My choices belong under the Lordship of Christ.`,
  },

  // =========================================================================
  // LOW SELF-ESTEEM
  // =========================================================================

  {
    title: "Low Self-Esteem",
    icon: "star",
    verse: "Psalm 139:14",
    scripture:
      "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works.",

    scriptures: kjv([
      "Psalm 139:14",
      "Ephesians 2:10",
      "1 Peter 2:9",
      "Romans 8:1",
      "2 Corinthians 5:17",
    ]),

    declaration: (n) =>
      `I, ${n}, receive my identity from God. I am His workmanship, and I refuse to define myself by rejection, comparison, or failure. I will walk in the identity He gives me.`,
  },

  // =========================================================================
  // SEDUCTIVE THOUGHTS
  // =========================================================================

  {
    title: "Seductive Thoughts",
    icon: "warning",
    verse: "James 1:14–15",
    scripture:
      "But every man is tempted, when he is drawn away of his own lust, and enticed.",

    scriptures: kjv([
      "James 1:14–15",
      "1 Corinthians 10:13",
      "Philippians 4:8",
      "2 Corinthians 10:5",
      "Job 31:1",
    ]),

    declaration: (n) =>
      `I, ${n}, will not entertain thoughts that lead me away from God. I will take temptation seriously, take the way of escape, and fill my mind with things that are true, pure, and worthy of praise.`,
  },

  // =========================================================================
  // HERESIES
  // =========================================================================

  {
    title: "Heresies",
    icon: "alert-circle",
    verse: "2 Timothy 4:3–4",
    scripture:
      "For the time will come when they will not endure sound doctrine; but after their own lusts shall they heap to themselves teachers, having itching ears.",

    scriptures: kjv([
      "2 Timothy 4:3–4",
      "Galatians 1:8",
      "Acts 17:11",
      "1 John 4:1",
      "2 Peter 2:1",
    ]),

    declaration: (n) =>
      `I, ${n}, will hold fast to sound doctrine. I will test what I hear against the Word of God, refuse false teaching, and remain rooted in Christ and the truth of Scripture.`,
  },

  // =========================================================================
  // NEW BATTLE: ANGER
  // =========================================================================

  {
    title: "Anger",
    icon: "flame-outline",
    verse: "Ephesians 4:26–27",
    scripture:
      "Be ye angry, and sin not: let not the sun go down upon your wrath: Neither give place to the devil.",

    scriptures: kjv([
      "Ephesians 4:26–27",
      "James 1:19–20",
      "Proverbs 14:29",
      "Proverbs 15:1",
      "Colossians 3:8",
    ]),
    description: "Anger that is unchecked can wound relationships and give the enemy a foothold.",
    howToFight: [
      "Pause before you speak — practice slow, prayerful responses.",
      "Bring your anger to God in prayer and ask for wise counsel.",
      "Confess any uncontrolled wrath and choose forgiveness where possible.",
      "Use Scripture to reframe the moment and take every thought captive.",
      "Repeat prayer and obedience — avoid triggers where necessary.",
    ],
    prayer:
      "Father, help me to be slow to anger and quick to hear. Give me self-control and soften my heart where it is hard.",
    fasting:
      "If you are able, set aside a meal as a brief fast and use the time to pray for gentleness and self-control.",
    repentance:
      "Where anger has become a habit, confess it and ask God to heal wounds that produce wrath.",
    recommendedReadingKey: "Anger",
    audioCategory: null,
    declaration: (n) =>
      `I, ${n}, will not surrender my heart to sinful anger. I will be slow to speak, slow to wrath, quick to listen, and willing to forgive. I refuse to give bitterness room to grow.`,
  },

  // =========================================================================
  // NEW BATTLE: BITTERNESS
  // =========================================================================

  {
    title: "Bitterness",
    icon: "water-outline",
    verse: "Hebrews 12:15",
    scripture:
      "Looking diligently lest any man fail of the grace of God; lest any root of bitterness springing up trouble you, and thereby many be defiled.",

    scriptures: kjv([
      "Hebrews 12:15",
      "Ephesians 4:31–32",
      "Colossians 3:12–13",
      "Proverbs 17:9",
      "Romans 12:19–21",
    ]),
    description: "Root bitterness corrodes relationships and blinds the heart to God's grace.",
    howToFight: [
      "Name the hurt and bring it before the Lord in prayer.",
      "Choose forgiveness — pray for the one who hurt you.",
      "Seek wise counsel and, if necessary, reconciliation steps.",
      "Deliberately replace resentment with gratitude and praise.",
    ],
    prayer:
      "Lord, uncover any root of bitterness in me. Help me to forgive as You have forgiven me and to receive Your healing.",
    fasting:
      "Consider a short fast focused on releasing the past and asking God for supernatural forgiveness.",
    repentance:
      "Confess any desire for revenge or sustained resentment and ask God for a heart of mercy.",
    recommendedReadingKey: "Bitterness",
    audioCategory: null,
    declaration: (n) =>
      `I, ${n}, refuse to nourish bitterness. I surrender the wound to God, forgive where I must, and refuse to let yesterday poison my heart or my relationships.`,
  },

  // =========================================================================
  // NEW BATTLE: SHAME
  // =========================================================================

  {
    title: "Shame",
    icon: "eye-off-outline",
    verse: "Romans 8:1",
    scripture:
      "There is therefore now no condemnation to them which are in Christ Jesus.",

    scriptures: kjv([
      "Romans 8:1",
      "Psalm 34:5",
      "Isaiah 54:4",
      "1 John 1:9",
      "Hebrews 12:2",
    ]),
    description: "Shame accuses and keeps us from receiving God's forgiveness and freedom.",
    howToFight: [
      "Confess honestly to God and, where appropriate, to a trusted believer.",
      "Receive God's forgiveness — meditate on verses that declare your identity in Christ.",
      "Replace shame-narratives with Scripture truths about redemption.",
    ],
    prayer:
      "Father, I bring my shame to You. Thank You that there is no condemnation for those in Christ Jesus.",
    fasting:
      "If safe, fast and use the time to repent, read Scripture, and ask God to renew your mind.",
    repentance:
      "Confess what must be confessed and accept God’s forgiveness; renounce false narratives about your worth.",
    recommendedReadingKey: "Shame",
    audioCategory: null,
    declaration: (n) =>
      `I, ${n}, bring my shame before Christ. I will confess what needs to be confessed, receive God's forgiveness, and refuse to let condemnation define who I am in Him.`,
  },

  // =========================================================================
  // NEW BATTLE: ISOLATION
  // =========================================================================

  {
    title: "Isolation",
    icon: "people-outline",
    verse: "Ecclesiastes 4:9–10",
    scripture:
      "Two are better than one; because they have a good reward for their labour. For if they fall, the one will lift up his fellow.",

    scriptures: kjv([
      "Ecclesiastes 4:9–10",
      "Hebrews 10:24–25",
      "Galatians 6:2",
      "Proverbs 18:1",
      "Romans 12:4–5",
    ]),
    description: "Isolation can steal perspective and strength; God designed community for mutual care.",
    howToFight: [
      "Take one step toward community — call a trusted friend or small group leader.",
      "Share one honest request for prayer this week.",
      "Connect with a local church or service opportunity when you are able.",
    ],
    prayer:
      "Lord, lead me into wise fellowship. Give me courage to reach out and receive help when I need it.",
    fasting:
      "Fast from isolating activities (excessive screen time) and invest that time in prayer and relational outreach.",
    repentance:
      "Ask God to show any pride or fear that keeps you isolated and repent from it.",
    recommendedReadingKey: "Isolation",
    audioCategory: null,
    declaration: (n) =>
      `I, ${n}, will not make isolation my hiding place. I will seek healthy fellowship, wise counsel, prayer, and godly community. I do not have to carry every burden alone.`,
  },

  // =========================================================================
  // NEW BATTLE: SPIRITUAL APATHY
  // =========================================================================

  {
    title: "Spiritual Apathy",
    icon: "flame-outline",
    verse: "Revelation 3:15–16",
    scripture:
      "I know thy works, that thou art neither cold nor hot: I would thou wert cold or hot.",

    scriptures: kjv([
      "Revelation 3:15–16",
      "Revelation 2:4–5",
      "Psalm 63:1",
      "Matthew 5:6",
      "Romans 12:11",
    ]),
    description: "Spiritual apathy dulls the soul; God calls us to hunger and seek Him.",
    howToFight: [
      "Begin with small spiritual disciplines: 10 minutes of Scripture and prayer daily.",
      "Remove distractions and set a regular time for worship and reflection.",
      "Find an accountability partner to encourage spiritual growth.",
    ],
    prayer:
      "Father, rekindle the fire within me. Help me hunger for Your presence and Your Word.",
    fasting:
      "Consider a short fast to refocus your heart on God rather than comfort.",
    repentance:
      "Confess any neglect of spiritual practices and commit to returning to them in small, sustainable steps.",
    recommendedReadingKey: "Spiritual Apathy",
    audioCategory: null,
    declaration: (n) =>
      `I, ${n}, refuse spiritual apathy. I will return to the Lord, seek Him sincerely, open His Word, pray, worship, and serve Him with renewed hunger.`,
  },
];