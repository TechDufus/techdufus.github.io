graph {
  border: 1px solid black;
  fill: oldlace;
  background: goldenrod;
  label: Office Hardware;
  }
edge { label-color: green; color: blue; }

[ZSA Moonlander MRK I Keyboard] -- USBC/USB3 --> [USB Switch]
[Logitech C925 Webcam] -- USB3 --> [USB Switch]
[Logitech MX Master3 Mouse] -- USB3 --> [USB Switch]
[Rode NT-USB+ Mic] -- USB3 --> [USB Switch]

[Logitech C922e Webcam] --> [Sherlock PC]

[USB Switch] == USB3 ==> [HP Dock]
[USB Switch] == USB3 ==> [Sherlock PC]

[Dell 49" CRG9 Monitor] -- HDMI --> [Sherlock PC]
[Dell 49" CRG9 Monitor] -- HDMI --> [HP Dock]
[Viotek 27" Monitor] -- HDMI --> [Sherlock PC]
[HP 22" Monitor] -- HDMI/USBC --> [Sherlock PC]

[HP Dock] -- Thunderbolt --> [MacBook M3 Pro]

[Creative T100 Speakers] ..> [LiNKFOR Audio Switch]
[LiNKFOR Audio Switch] ..> [HP Dock]
[LiNKFOR Audio Switch] ..> [Sherlock PC]


[Logitech Litra Beam] --> [Sherlock PC]
