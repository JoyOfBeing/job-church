'use client';

import Link from 'next/link';

export default function BraidGuidePage() {
  return (
    <div className="legal-page">
      <h1>Braid Up</h1>
      <p className="doctrine-subtitle">A practice for three people.</p>
      <p style={{ textAlign: 'center', color: '#999aab', marginBottom: '2rem' }}>
        Conscious relationship, self-awareness, and creation &mdash; in real time.
      </p>

      <div className="legal-content">

        <section>
          <h2>Why Three People?</h2>
          <p>
            Three is not arbitrary. It is structural. A conversation between two people tends
            to become a mirror &mdash; agreement, argument, or echo chamber. Add a third person
            and the geometry changes completely. Suddenly there is a witness. Someone who can
            see what the other two cannot.
          </p>
          <p>
            The triangle is the strongest shape in nature because force distributes across
            three points, not two. The same is true for human dynamics.
          </p>
          <p>Most people default to the <strong>Drama Triangle</strong> when things get hard:</p>

          <div className="braid-triangle">
            <div className="triangle-row">
              <div className="triangle-role triangle-drama">
                <strong>Victim</strong>
                <span>&ldquo;This is happening to me.&rdquo;</span>
              </div>
              <div className="triangle-role triangle-drama">
                <strong>Persecutor</strong>
                <span>&ldquo;This is your fault.&rdquo;</span>
              </div>
              <div className="triangle-role triangle-drama">
                <strong>Rescuer</strong>
                <span>&ldquo;Let me fix this for you.&rdquo;</span>
              </div>
            </div>
          </div>

          <p>Braid Up shifts the triangle to its <strong>empowered form</strong>:</p>

          <div className="braid-triangle">
            <div className="triangle-row">
              <div className="triangle-role triangle-empowered">
                <strong>Coach</strong>
                <span>&ldquo;I&apos;m with you.&rdquo;</span>
              </div>
              <div className="triangle-role triangle-empowered">
                <strong>Challenger</strong>
                <span>&ldquo;I believe you can face this.&rdquo;</span>
              </div>
              <div className="triangle-role triangle-empowered">
                <strong>Creator</strong>
                <span>&ldquo;Let&apos;s make something new.&rdquo;</span>
              </div>
            </div>
          </div>

          <p>
            In a Braid, you are not assigned one role. You weave between all three. That
            weaving &mdash; Coach to Challenger to Creator and back &mdash; is the braid itself.
            The power is in the movement between them.
          </p>
        </section>

        <section>
          <h2>Why Marco Polo?</h2>
          <p>
            Marco Polo is a free video messaging app. You record a short video, send it to your
            group, and the others watch and respond on their own time. No scheduling, no calendar
            coordination, no live call. This matters for four reasons:
          </p>
          <ol>
            <li>
              <strong>No interruption.</strong> Nobody can cut you off or talk over you.
              You get to say the full thing.
            </li>
            <li>
              <strong>More honest expression.</strong> People are more truthful when they have
              space to find their words without performing for a live audience.
            </li>
            <li>
              <strong>Deeper listening.</strong> When you watch someone&apos;s message, you are only
              listening. You receive first. You respond second.
            </li>
            <li>
              <strong>Fits real life.</strong> Three busy people will never consistently find a
              shared hour. But three busy people can each find five minutes at different points
              in their day.
            </li>
          </ol>
          <p className="braid-pullquote">
            Think of it this way: a braid is three strands weaving together. They don&apos;t
            have to move at the same time. They just have to keep weaving.
          </p>
        </section>

        <section>
          <h2>The Five Moves</h2>
          <p>
            Every braid exchange follows the same five moves. They are a rhythm, not a script.
            Over time they become instinctive.
          </p>

          <div className="braid-moves">
            <div className="braid-move">
              <div className="braid-move-number">1</div>
              <div className="braid-move-content">
                <strong>Tell your truth</strong>
                <p>Share what is real right now. Not what you think you should say.</p>
                <span className="braid-move-example">
                  &ldquo;Here&apos;s what&apos;s going on...&rdquo; &ldquo;The thing I keep circling is...&rdquo;
                </span>
              </div>
            </div>

            <div className="braid-move">
              <div className="braid-move-number">2</div>
              <div className="braid-move-content">
                <strong>Witness</strong>
                <p>Reflect what you heard before trying to fix, advise, or respond.</p>
                <span className="braid-move-example">
                  &ldquo;What I heard you say is...&rdquo; &ldquo;I felt [X] listening to you.&rdquo;
                </span>
              </div>
            </div>

            <div className="braid-move">
              <div className="braid-move-number">3</div>
              <div className="braid-move-content">
                <strong>Challenge</strong>
                <p>Name one honest edge. Not a critique &mdash; a loving truth.</p>
                <span className="braid-move-example">
                  &ldquo;The part you might be avoiding is...&rdquo; &ldquo;What if the opposite were true?&rdquo;
                </span>
              </div>
            </div>

            <div className="braid-move">
              <div className="braid-move-number">4</div>
              <div className="braid-move-content">
                <strong>Create</strong>
                <p>Offer or choose one next step. Not a five-year plan. One concrete move.</p>
                <span className="braid-move-example">
                  &ldquo;One thing you could do today is...&rdquo; &ldquo;My next move is...&rdquo;
                </span>
              </div>
            </div>

            <div className="braid-move">
              <div className="braid-move-number">5</div>
              <div className="braid-move-content">
                <strong>Keep it moving</strong>
                <p>Don&apos;t over-process. Let the energy move forward.</p>
                <span className="braid-move-example">
                  &ldquo;That landed. I&apos;m going to...&rdquo; or simply the next person goes.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2>A Sample Exchange</h2>
          <p className="braid-sample-intro">
            Total time: about 12 minutes across three people, spread throughout the day.
          </p>

          <div className="braid-sample">
            <div className="braid-sample-msg">
              <span className="braid-sample-who">Person A</span>
              <span className="braid-sample-time">8:14 am</span>
              <p>
                &ldquo;I&apos;m avoiding a conversation with my business partner about money.
                I keep telling myself the timing isn&apos;t right but honestly I&apos;m just
                scared of conflict. That&apos;s what&apos;s real.&rdquo;
              </p>
            </div>
            <div className="braid-sample-msg">
              <span className="braid-sample-who">Person B</span>
              <span className="braid-sample-time">10:30 am</span>
              <p>
                &ldquo;I heard fear of conflict, and I also heard you already know what you need
                to say. The timing excuse feels like a pattern. One edge: what if waiting IS the
                conflict? What if you just sent a text today that says &lsquo;Can we talk about
                money this week?&rsquo;&rdquo;
              </p>
            </div>
            <div className="braid-sample-msg">
              <span className="braid-sample-who">Person C</span>
              <span className="braid-sample-time">12:45 pm</span>
              <p>
                &ldquo;You sounded relieved just saying it out loud. That tells me you&apos;re
                ready. My challenge: stop rehearsing the perfect conversation and just open
                the door. Text them today. Report back.&rdquo;
              </p>
            </div>
            <div className="braid-sample-msg">
              <span className="braid-sample-who">Person A</span>
              <span className="braid-sample-time">4:20 pm</span>
              <p>
                &ldquo;I sent the text. They responded immediately and want to talk Thursday.
                I feel lighter already. Ok, B &mdash; your turn. What&apos;s real for you?&rdquo;
              </p>
            </div>
          </div>

          <p>
            Four short video messages. The braid did in 12 minutes what weeks of internal
            circling could not.
          </p>
        </section>

        <section>
          <h2>The Ground Rules</h2>
          <p>Few rules. Non-negotiable.</p>
          <ul>
            <li>
              <strong>Witness before you fix.</strong> When someone shares, your first response
              must be witnessing &mdash; reflecting what you heard, not jumping to advice.
            </li>
            <li>
              <strong>Challenge without shaming.</strong> A challenge is an act of belief. Name
              the edge with kindness and directness.
            </li>
            <li>
              <strong>No rescuing.</strong> Don&apos;t rush in to make someone feel better.
              Trust that the person can hold what is arising.
            </li>
            <li>
              <strong>No performance.</strong> Don&apos;t re-record to sound smarter. Say it.
              Send it. Messy and real beats polished and performative every time.
            </li>
            <li>
              <strong>Humor is welcome.</strong> This is serious play, not serious work.
              If the braid feels heavy and stuck, someone needs to shift the energy.
            </li>
            <li>
              <strong>Braids are fluid.</strong> Keep one going for months or let it pause.
              Be in multiple braids at once. Start or stop anytime. This is a practice field.
            </li>
          </ul>
        </section>

        <section>
          <h2>The Self-Braid</h2>
          <p>
            You can braid with yourself as a daily check-in. Five questions. Two minutes.
          </p>
          <ol>
            <li><strong>Where am I hooked?</strong> What is pulling my attention, triggering me, or looping?</li>
            <li><strong>What is true?</strong> Beneath the story and the performance &mdash; what is actually real?</li>
            <li><strong>What am I avoiding?</strong> What conversation, action, or feeling am I refusing to face?</li>
            <li><strong>What would courage do?</strong> If fear were not a factor, what would I do next?</li>
            <li><strong>What is one next move?</strong> Not the whole plan. One step. Today.</li>
          </ol>
          <p>
            Journal, voice memo, or just in your head while walking. The pattern is the same
            whether there are three of you or one: truth, witness, challenge, create, move.
          </p>
        </section>

        <section>
          <h2>What Braid Up Is For</h2>
          <p>
            This is not a program, a course, or a commitment. It is an on-the-job training
            tool for being human. Use it to integrate:
          </p>
          <ul>
            <li><strong>Life events</strong> &mdash; a job change, a breakup, a move, a loss, a beginning</li>
            <li><strong>Business challenges</strong> &mdash; a difficult conversation, a strategic decision, a creative block</li>
            <li><strong>Emotional experiences</strong> &mdash; grief, anger, excitement, fear, joy, confusion</li>
            <li><strong>Relationship dynamics</strong> &mdash; a pattern you keep repeating, a boundary you need to set</li>
            <li><strong>Creative ideas</strong> &mdash; a project you cannot start, a vision you cannot articulate</li>
            <li><strong>Personal growth</strong> &mdash; the gap between who you are and who you are becoming</li>
          </ul>
          <p className="braid-pullquote">
            Life happens. You braid. Something shifts.
          </p>
        </section>

      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link href="/braid" className="btn btn-gold">Back to Your Braids</Link>
      </div>
    </div>
  );
}
