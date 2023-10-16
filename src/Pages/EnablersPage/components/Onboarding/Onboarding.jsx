import React from 'react'
import styles from './Onboarding.module.css'
import Mu from '../../assests/Mu.webp'
import Discord from '../../assests/Discord.webp'
import Bulb from '../../assests/Bulb.webp'
export default function Onboarding() {
  return (
    <div id="Onboarding" className={styles.onboarding}>
       <h1><span className={styles.onboardingHeading}>Onboarding </span>Process</h1>
        <div className={styles.onboardingList}>
            <h1><span>1</span><img src={Mu} alt="" />Create µLearn Profile</h1>
            <p>Enablers should create a profile via app.mulearn.org, and they should ensure to register as a faculty member by choosing the option “I’m teaching in an Institute”. Once you get a profile, go to “Connect Discord” and join our Discord server.</p>
        </div>

        <div className={styles.onboardingList}>
            <h1><span>2</span><img src={Discord} alt="" />Welcome to Discord</h1>
            <p>Once you join the server, our bot, Aaronchetan will send you a DM asking you to connect your µ-ID, which is provided in the µlearn profile. Once it’s connected, you can start your onboarding process.</p>
        </div>

        <div className={styles.onboardingList}>
            <h1><span>3</span><img src={Bulb} alt="" />Add Interest Groups</h1>
            <p>Now you will have access to the #lvl1-info channel, and as you do the tasks, you will progress through the levels. Once you reach level 4, you will have the option to edit Interest Groups on your µlearn profile page.</p>
        </div>
    </div>
  )
}