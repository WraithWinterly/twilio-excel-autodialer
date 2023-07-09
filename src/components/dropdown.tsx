import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useId, useState } from "react";
import { IoIosArrowDropdown } from "react-icons/io";

interface DropdownProps {
  items: string[];
  onSelect: (item: string) => void;
}

export default function Dropdown({ items, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const id = useId();

  useEffect(() => {
    if (selectedItem === "") {
      setSelectedItem(items[0]!);
      onSelect(items[0]!);
    }
  }, [items]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setIsOpen(false);
    console.log(item);
    onSelect(item);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className="inline-flex w-full items-center justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          onClick={toggleDropdown}
        >
          <span className="text-xl">{selectedItem}</span>
          <IoIosArrowDropdown
            className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-black/70 text-white shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-md focus:outline-none">
          {items.map((item, i) => (
            <Menu.Item key={`${id}-${item}-${i}`}>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-black/80 text-white" : "text-gray-300"
                  } group flex w-full items-center rounded-md px-2 py-4 text-end text-base transition-colors duration-300`}
                  onClick={() => handleItemClick(item)}
                  key={`${id}-${item}-${i}`}
                >
                  {item}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
