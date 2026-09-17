import "./TrainingScheduleScreen.css";
import { useState } from 'react';
import { Award, Building2, CalendarCheck, CalendarDays, CalendarPlus, Check, CheckCircle2, Clock3, Copy, HelpCircle, IdCard, MapPin, Monitor, Navigation, PhoneCall, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

export interface TrainingScheduleScreenProps {
  examDate: Date | string;
  centerName: string;
  centerId: string;
  examStartTime?: string;
  arriveByTime?: string;
  verificationMessage?: string;
  wasAutoRescheduled?: boolean;
  onGoToProfile: () => void;
}

export function TrainingScheduleScreen({
  examDate,
  centerName,
  centerId,
  examStartTime,
  arriveByTime,
  verificationMessage,
  wasAutoRescheduled,
  onGoToProfile,
}: TrainingScheduleScreenProps) {
  const { i18n } = useTranslation();
  const ur = i18n.language === 'ur';
  const t = (en: string, urdu: string) => ur ? urdu : en;
  const [message, setMessage] = useState('');

  const dateObj = (() => {
    try {
      if (!examDate) return new Date();
      return typeof examDate === 'string' ? parseISO(examDate) : examDate;
    } catch (e) {
      return new Date();
    }
  })();

  const centre = {
    name: centerName || 'Peshawar Training Centre (PTC)',
    address: 'Government Advance Technical Training Center, Plot 16/A, Industrial Area, TEVTA KPK, Hayatabad, Peshawar, Pakistan', // hardcoded fallback
    phone: '+92 91 9225473',
    phoneHref: '+92919225473',
    maps: 'https://www.google.com/maps/search/?api=1&query=Government%20Advance%20Technical%20Training%20Center'
  };

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(centre.address);
      setMessage(t('Address copied.', 'پتہ کاپی ہو گیا۔'));
    } catch {
      setMessage(t('Select and copy the address shown below.', 'نیچے دیا گیا پتہ منتخب کر کے کاپی کریں۔'));
    }
    setTimeout(() => setMessage(''), 2500);
  }

  function addCalendar() {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SoftSkills//Training//EN', 'BEGIN:VEVENT',
      'UID:softskills-training@candidate', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:' + format(dateObj, 'yyyyMMdd') + 'T040000Z', 'DTEND:' + format(dateObj, 'yyyyMMdd') + 'T120000Z',
      'SUMMARY:SoftSkills Training Day', 'LOCATION:' + centre.address.replace(/,/g, '\\,'),
      'DESCRIPTION:Arrive by ' + (arriveByTime || '8:00 AM') + '. Bring your original CNIC. One-day in-person training and computer-based exam.',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'softskills-training.ics';
    a.click();
    URL.revokeObjectURL(url);
    setMessage(t('Calendar file downloaded.', 'کیلنڈر فائل ڈاؤن لوڈ ہو گئی۔'));
    setTimeout(() => setMessage(''), 2500);
  }

  return (
    <div className={`training-page ${ur ? 'cp-urdu' : ''}`} dir={ur ? 'rtl' : 'ltr'}>
      <main id="training-main" className="cp-container cp-main training-main">
        <section className="training-hero">
          <div className="training-hero-copy">
            <span className="training-success">
              <CheckCircle2 size={17} />{t('REGISTRATION COMPLETE · PAYMENT RECEIVED', 'رجسٹریشن مکمل · ادائیگی موصول')}
            </span>
            <h1>{t('Your training is booked.', 'آپ کی تربیت مقرر ہو گئی ہے۔')}</h1>
            <p>{t('Your centre and date are confirmed. Save the location and arrive by ' + (arriveByTime || '8:00 AM') + ' for check-in.', 'آپ کا مرکز اور تاریخ طے ہیں۔ مقام محفوظ کریں اور حاضری کے لیے صبح ۸ بجے پہنچیں۔')}</p>
            <div className="training-hero-actions">
              <Button className="training-primary" onClick={addCalendar}>
                <CalendarPlus size={19} />{t('Add to calendar', 'کیلنڈر میں شامل کریں')}
              </Button>
              <Button className="training-secondary" asChild>
                <a href={centre.maps} target="_blank" rel="noreferrer">
                  <Navigation size={19} />{t('Open in Google Maps', 'گوگل میپس میں کھولیں')}
                </a>
              </Button>
            </div>
          </div>
          <div className="training-date-ticket">
            <span>{format(dateObj, 'EEEE').toUpperCase()}</span>
            <strong>{format(dateObj, 'd')}</strong>
            <b>{format(dateObj, 'MMMM yyyy').toUpperCase()}</b>
            <i />
            <small>{t('ARRIVE', 'پہنچیں')} <em dir="ltr">{arriveByTime || '8:00 AM'}</em></small>
          </div>
        </section>
        
        <div className="training-layout">
          <div className="training-primary-column">
            <section className="cp-card schedule-card">
              <div className="schedule-heading">
                <span><CalendarDays size={24} /></span>
                <div>
                  <span className="cp-kicker">{t('YOUR CONFIRMED SCHEDULE', 'آپ کا مقررہ شیڈول')}</span>
                  <h2>{t('Training day details', 'تربیت کے دن کی معلومات')}</h2>
                </div>
                <span className="confirmed-pill"><Check size={15} />{t('Confirmed', 'تصدیق شدہ')}</span>
              </div>
              <div className="schedule-facts">
                <div>
                  <Clock3 /><span>{t('Check-in', 'حاضری')}</span>
                  <strong dir="ltr">{arriveByTime || '8:00 AM'}</strong>
                  <small>{t('Please arrive by this time', 'اس وقت تک پہنچ جائیں')}</small>
                </div>
                <div>
                  <Users /><span>{t('Training begins', 'تربیت شروع')}</span>
                  <strong dir="ltr">{examStartTime || '9:00 AM'}</strong>
                  <small>{t('One day, in person', 'ایک دن، بالمشافہ')}</small>
                </div>
                <div>
                  <Monitor /><span>{t('Assessment', 'امتحان')}</span>
                  <strong>{t('Towards day-end', 'دن کے اختتام پر')}</strong>
                  <small>{t('Computer-based at the centre', 'مرکز میں کمپیوٹر پر')}</small>
                </div>
              </div>
              <div className="schedule-reminder">
                <Clock3 size={19} />
                <p>
                  <strong>{t('Plan to keep the full day available.', 'پورا دن تربیت کے لیے خالی رکھیں۔')}</strong>
                  {t('Check-in, physical training and the computer-based exam take place at the centre.', 'حاضری، بالمشافہ تربیت اور کمپیوٹر پر امتحان مرکز میں ہوگا۔')}
                </p>
              </div>
            </section>
            
            <section className="cp-card centre-card">
              <div className="centre-card-heading">
                <div>
                  <span className="cp-kicker">{t('YOUR ASSIGNED CENTRE', 'آپ کا مقررہ مرکز')}</span>
                  <h2>{centre.name}</h2>
                </div>
                <span className="centre-code">{centerId || 'PTC'}</span>
              </div>
              <div className="centre-content">
                <a className="centre-map" href={centre.maps} target="_blank" rel="noreferrer" aria-label={t('Open Centre in Google Maps', 'مرکز گوگل میپس میں کھولیں')}>
                  <span className="map-road road-one" />
                  <span className="map-road road-two" />
                  <span className="map-road road-three" />
                  <span className="map-pin"><MapPin size={29} /><i /></span>
                  <span className="map-label">{t('LOCATION', 'مقام')}</span>
                  <span className="map-open"><Navigation size={15} />{t('Open pin', 'پن کھولیں')}</span>
                </a>
                <div className="centre-contact">
                  <div className="contact-row">
                    <span><Building2 size={21} /></span>
                    <div>
                      <small>{t('Centre name', 'مرکز کا نام')}</small>
                      <strong>{centre.name}</strong>
                    </div>
                  </div>
                  <div className="contact-row">
                    <span><MapPin size={21} /></span>
                    <div>
                      <small>{t('Full address', 'مکمل پتہ')}</small>
                      <address>{centre.address}</address>
                    </div>
                  </div>
                  <div className="contact-row">
                    <span><PhoneCall size={21} /></span>
                    <div>
                      <small>{t('Centre phone', 'مرکز کا فون')}</small>
                      <a href={`tel:${centre.phoneHref}`} dir="ltr">{centre.phone}</a>
                    </div>
                  </div>
                  <div className="centre-actions">
                    <Button className="training-primary" asChild>
                      <a href={centre.maps} target="_blank" rel="noreferrer"><Navigation size={18} />{t('Get directions', 'راستہ دیکھیں')}</a>
                    </Button>
                    <Button className="contact-button" asChild>
                      <a href={`tel:${centre.phoneHref}`}><PhoneCall size={18} />{t('Call centre', 'مرکز کو کال کریں')}</a>
                    </Button>
                    <button className="copy-button" onClick={copyAddress}>
                      <Copy size={18} />{t('Copy address', 'پتہ کاپی کریں')}
                    </button>
                  </div>
                  {message && <p className="training-message" role="status">{message}</p>}
                </div>
              </div>
            </section>
            
            <section className="cp-card day-plan">
              <div className="day-plan-heading">
                <span className="cp-kicker">{t('KNOW WHAT TO EXPECT', 'پہلے سے جان لیں')}</span>
                <h2>{t('Your day, step by step', 'آپ کے دن کے مراحل')}</h2>
              </div>
              <ol>
                <li className="complete">
                  <span><Check size={17} /></span>
                  <div>
                    <strong>{t('Arrive and check in', 'پہنچیں اور حاضری لگائیں')}</strong>
                    <p>{t('Show your original CNIC at the centre.', 'مرکز میں اپنا اصل شناختی کارڈ دکھائیں۔')}</p>
                  </div>
                  <time dir="ltr">{arriveByTime || '8:00 AM'}</time>
                </li>
                <li>
                  <span><Users size={17} /></span>
                  <div>
                    <strong>{t('Attend physical training', 'بالمشافہ تربیت لیں')}</strong>
                    <p>{t('Learn and practise useful workplace skills with a trainer.', 'تربیت دینے والے کے ساتھ کام کی مفید مہارتیں سیکھیں اور مشق کریں۔')}</p>
                  </div>
                  <time dir="ltr">{examStartTime || '9:00 AM'}</time>
                </li>
                <li>
                  <span><Monitor size={17} /></span>
                  <div>
                    <strong>{t('Take the computer-based exam', 'کمپیوٹر پر امتحان دیں')}</strong>
                    <p>{t('Complete your assessment towards the end of the training day.', 'تربیت کے دن کے اختتام پر امتحان مکمل کریں۔')}</p>
                  </div>
                  <time>{t('Day-end', 'اختتام پر')}</time>
                </li>
                <li>
                  <span><Award size={17} /></span>
                  <div>
                    <strong>{t('Certificate process', 'سرٹیفکیٹ کا عمل')}</strong>
                    <p>{t('Your certificate follows the programme process after training and the exam.', 'تربیت اور امتحان کے بعد پروگرام کے طریقہ کار کے مطابق سرٹیفکیٹ ملے گا۔')}</p>
                  </div>
                  <time>{t('Afterwards', 'بعد میں')}</time>
                </li>
              </ol>
            </section>
          </div>
          
          <aside className="training-side-column">
            <section className="cp-card bring-card">
              <span className="cp-kicker">{t('BEFORE YOU LEAVE HOME', 'گھر سے نکلنے سے پہلے')}</span>
              <h2>{t('Bring these with you', 'یہ چیزیں ساتھ لائیں')}</h2>
              <div>
                <span><IdCard size={22} /></span>
                <p>
                  <strong>{t('Original CNIC', 'اصل شناختی کارڈ')}</strong>
                  <small>{t('Required for identity verification', 'شناخت کی تصدیق کے لیے ضروری')}</small>
                </p>
                <CheckCircle2 size={19} />
              </div>
              <div>
                <span><CalendarCheck size={22} /></span>
                <p>
                  <strong>{t('Your schedule details', 'اپنے شیڈول کی معلومات')}</strong>
                  <small>{t('Keep this page or a screenshot', 'یہ صفحہ یا اس کی تصویر محفوظ رکھیں')}</small>
                </p>
                <CheckCircle2 size={19} />
              </div>
              <div>
                <span><Clock3 size={22} /></span>
                <p>
                  <strong>{t('Enough travel time', 'سفر کے لیے مناسب وقت')}</strong>
                  <small>{t('Aim to reach by ' + (arriveByTime || '8:00 AM'), 'صبح ۸ بجے تک پہنچنے کی کوشش کریں')}</small>
                </p>
                <CheckCircle2 size={19} />
              </div>
            </section>
            
            {verificationMessage && (
              <section className="training-alert" style={{ background: 'var(--amber-500-10)', borderColor: 'var(--amber-500-30)' }}>
                <ShieldCheck size={23} style={{ color: 'var(--amber-600)' }} />
                <div>
                  <h3>{t('Important Update', 'اہم اطلاع')}</h3>
                  <p>{verificationMessage}</p>
                </div>
              </section>
            )}

            <section className="training-alert">
              <ShieldCheck size={23} />
              <div>
                <h3>{t('Avoid being marked absent', 'غیر حاضر ہونے سے بچیں')}</h3>
                <p>{t('Arrive by the stated check-in time. If you expect a problem, call the centre before travelling.', 'مقررہ حاضری کے وقت تک پہنچیں۔ اگر کوئی مسئلہ ہو تو روانگی سے پہلے مرکز کو کال کریں۔')}</p>
              </div>
            </section>
            
            <section className="cp-card progress-card">
              <span className="cp-kicker">{t('YOUR PROGRESS', 'آپ کی پیش رفت')}</span>
              <h2>{t('Ready for training', 'تربیت کے لیے تیار')}</h2>
              <div className="mini-progress">
                <span className="done"><Check /></span><i />
                <span className="done"><Check /></span><i />
                <span className="current"><CalendarCheck /></span>
              </div>
              <div className="mini-progress-labels">
                <span>{t('Registered', 'رجسٹرڈ')}</span>
                <span>{t('Paid', 'ادائیگی')}</span>
                <span>{t('Scheduled', 'شیڈول')}</span>
              </div>
              <p>{t('Next: attend your centre on the assigned date.', 'اگلا مرحلہ: مقررہ تاریخ پر مرکز جائیں۔')}</p>
            </section>
            
            <a className="training-help-link" href={`tel:${centre.phoneHref}`}>
              <HelpCircle size={19} />
              <span>
                <strong>{t('Need help with directions?', 'راستے کے لیے مدد چاہیے؟')}</strong>
                <small>{t('Call the training centre', 'تربیتی مرکز کو کال کریں')}</small>
              </span>
              <PhoneCall size={18} />
            </a>
          </aside>
        </div>
      </main>
    </div>
  );
}
