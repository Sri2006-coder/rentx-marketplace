'use client';

import { Button } from '@/components/ui/button';
import { categories, mockItems } from '@/lib/mockData';
import { Search, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 z-10" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-20 px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Own Less.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Experience More.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            The premium marketplace for renting high-end cameras, drones, gaming consoles, and equipment from locals near you.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="What do you need? (e.g., DSLR Camera, PS5)"
              className="w-full h-14 bg-white/5 border border-white/10 rounded-full pl-12 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/10 transition-all backdrop-blur-md shadow-2xl"
            />
            <div className="absolute inset-y-1.5 right-1.5">
              <Link href="/search">
                <Button className="h-full rounded-full px-6">
                  Search
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-background border-t border-white/5">
        <div className="container px-4 mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Browse by Category</h2>
              <p className="text-muted-foreground">Find exactly what you are looking for.</p>
            </div>
            <Link href="/search" className="hidden md:flex items-center text-primary hover:text-primary/80 transition-colors font-medium">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                key={cat.id}
                className="group cursor-pointer p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all text-center flex flex-col items-center justify-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                  {/* For mock data, we'll just use a generic package icon, in a real app map icon names to Lucide icons */}
                  <span className="text-xl font-bold text-primary group-hover:text-primary-foreground">
                    {cat.name.charAt(0)}
                  </span>
                </div>
                <span className="font-medium text-sm">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-20 bg-black/20">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-10">Featured Equipment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockItems.map((item, i) => (
              <Link href={`/items/${item.id}`} key={item.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group rounded-2xl bg-card border border-white/5 overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {item.rating}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">{item.category}</div>
                    <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{item.city}, {item.state}</p>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg">
                        ${item.dailyRate} <span className="text-sm font-normal text-muted-foreground">/ day</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
