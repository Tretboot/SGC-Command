//@title Autotomatone @by Switch Angel
setCpm(160/4)
const volume = slider(0.812)
all(x => x.mul(postgain(volume)))

$DRUMS: stack(
  s("bd:1!4")
).duck("3")

$LEAD: n("<0 <6 6 8 9> 0 2 4>*16".seg(16).rib(15,2).sub(2))
  .scale("f:minor").delay(.5).gain(1.3)
  .s("pulse").pwrate(2).pan(rand)

$CHORDS: n("<6 3 7 6>/2").chord("<F-7>/2").voicing().trans(-12)
.sound("supersaw")

$HAT: s("white!16").dec(tri.fast(4).range(0.05,.1))

$SNARES: s("sd!8").n(irand(16).seg(8)).hpf(500)
  .rib(5,.5).bank('mc303')
  .dec(.2).delay(rand)
  .delaytime(rand.fast(3))