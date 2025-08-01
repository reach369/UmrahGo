'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { getUserTypes } from '../data';

const UserTypes = () => {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('pilgrim');
  const userTypes = getUserTypes(t);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const activeType = userTypes.find((type) => type.id === activeTab);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            {t('howItWorks.userTypes.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('howItWorks.userTypes.subtitle')}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8 bg-primary/5 p-2 rounded-full">
            <Button
              onClick={() => setActiveTab('pilgrim')}
              variant={activeTab === 'pilgrim' ? 'default' : 'ghost'}
              className="rounded-full w-1/2"
            >
              {t('howItWorks.userTypes.pilgrimButton')}
            </Button>
            <Button
              onClick={() => setActiveTab('office')}
              variant={activeTab === 'office' ? 'default' : 'ghost'}
              className="rounded-full w-1/2"
            >
              {t('howItWorks.userTypes.officeButton')}
            </Button>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-card p-8 rounded-2xl shadow-lg"
          >
            {activeType && (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 text-primary">{activeType.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-primary">
                    {activeType.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {activeType.description}
                  </p>
                  <ul className="space-y-4">
                    {activeType.steps.map((step, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default UserTypes; 