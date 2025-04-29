'use client';

import { useState, useEffect , useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DentistItem {
  id: number;
  name: string;
  area_expertise: string | string[];
  StartingPrice: number;
  picture: string;
}

interface DentistCatalogProps {
  dentistsJson: Promise<{ data: DentistItem[] }>;
}

export default function DentistCatalog({ dentistsJson }: DentistCatalogProps) {
  const [search, setSearch] = useState<string>('');
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('none');
  const [dentists, setDentists] = useState<DentistItem[]>([]);
  const [filteredDentists, setFilteredDentists] = useState<DentistItem[]>([]);
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dentistsJson.then(data => {
      setDentists(data.data);
      setFilteredDentists(data.data);

      // Collect all unique areas of expertise
      const allAreas = new Set<string>();
      allAreas.add('All');
      
      data.data.forEach(dentist => {
        if (Array.isArray(dentist.area_expertise)) {
          dentist.area_expertise.forEach(area => allAreas.add(area));
        } else if (typeof dentist.area_expertise === 'string') {
          allAreas.add(dentist.area_expertise);
        }
      });
      
      setAreaOptions(Array.from(allAreas));
    });
  }, [dentistsJson]);

  useEffect(() => {
    let filtered = dentists.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );

    if (areaFilter !== 'All') {
      filtered = filtered.filter(d => {
        if (Array.isArray(d.area_expertise)) {
          return d.area_expertise.some(area => 
            area.toLowerCase() === areaFilter.toLowerCase()
          );
        } else if (typeof d.area_expertise === 'string') {
          return d.area_expertise.toLowerCase() === areaFilter.toLowerCase();
        }
        return false;
      });
    }

    if (sortOption === 'asc') {
      filtered = filtered.sort((a, b) => a.StartingPrice - b.StartingPrice);
    } else if (sortOption === 'desc') {
      filtered = filtered.sort((a, b) => b.StartingPrice - a.StartingPrice);
    }

    setFilteredDentists(filtered);
  }, [search, areaFilter, sortOption, dentists]);

  const handleCompareToggle = () => {
    setIsCompareMode(!isCompareMode);
    setSelectedIds([]); // reset selection when toggling
  };

  const handleCheckboxChange = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selected => selected !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const goToComparePage = () => {
    if (selectedIds.length === 2) {
      const queryString = selectedIds.join(',');
      router.push(`/dentist/compare?ids=${queryString}`);
    }
  };

  useEffect(() => {
    if (isCompareMode && selectedIds.length === 2 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isCompareMode, selectedIds]);

  // Helper function to format expertise areas for display
  const formatExpertiseAreas = (expertise: string | string[]): string => {
    if (Array.isArray(expertise)) {
      return expertise.join(', ');
    }
    return expertise;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 my-6">
        {/* Compare Toggle Button */}
        <button
          onClick={handleCompareToggle}
          className="flex items-center px-4 py-2 bg-[#4AA3BA] text-white rounded-lg hover:bg-[#3b8294] transition duration-300"
        >
          {isCompareMode ? 'Cancel Compare' : 'Compare'}
        </button>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search dentists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] pl-10"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>

        {/* Area Filter */}
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4AA3BA]"
        >
          {areaOptions.map((area, index) => (
            <option key={index} value={area}>
              {area}
            </option>
          ))}
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4AA3BA]"
        >
          <option value="none">Sort by Price</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      {/* Dentist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDentists.map((dentistItem: DentistItem) => {
          const isSelected = selectedIds.includes(dentistItem.id);
          const isDisabled = !isSelected && selectedIds.length >= 2;

          return (
            <div key={dentistItem.id} className="bg-white rounded-lg shadow-lg overflow-hidden relative">
              <div className="relative w-full h-64">
                <Image
                  src={dentistItem.picture}
                  alt={dentistItem.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{dentistItem.name}</h2>
                <p className="text-gray-600 mb-2">{formatExpertiseAreas(dentistItem.area_expertise)}</p>
                <p className="text-gray-600 mb-4">Starting price: {dentistItem.StartingPrice} ฿</p>

                {isCompareMode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => handleCheckboxChange(dentistItem.id)}
                      className="w-5 h-5"
                    />
                    <label className={`${(isCompareMode && selectedIds.length===2)?  'text-gray-400' : 'text-black' }`}>Select to Compare</label>
                  </div>
                ) : (
                  <Link
                    href={`/dentist/${dentistItem.id}`}
                    className="inline-block bg-[#4AA3BA] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#3b8294] transition duration-300"
                  >
                    View Profile and Booking
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compare Selected Button */}
      {isCompareMode && selectedIds.length === 2 && (
        <div className="text-center mt-10">
          <button
            onClick={goToComparePage}
            className="inline-block bg-[#4AA3BA] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#3b8294] transition duration-300"
          >
            Compare Selected Dentists
          </button>
        </div>
      )}
      <div className={`${(isCompareMode && selectedIds.length===2)?  'block' : 'hidden' } text-red-500 text-center text-md`}>You can select a maximum of 2 dentists.<br/><div className='text-green-600'>To change dentists for comparison, please deselect before selecting another.<br/>Click 'Compare Selected Dentists' to view the comparison.</div></div>
      <br/>
      <div className="text-center text-xl font-bold " ref={bottomRef}>
        Bottom of page
      </div>
    </>
  );
}