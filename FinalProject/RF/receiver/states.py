"""
# states.py

Created by:  Matt Kaufman
Date:        April 26, 2023

Code for the receiver (RX480E-4) of the 433MHz RF transmitter/receiver pair.
Defines the `States` class, which represents the states of the pins corresponding to North, South, East, and West.
"""

from datetime import datetime
import matplotlib.pyplot as plt



class States:
    """
    An object representing the states of the North, South, East, and West pins of the receiver.
    """
    def __init__(self, north: int, south: int, east: int, west: int):
        self._north = north
        self._south = south
        self._east  = east
        self._west  = west
        self._history = {
            "north": {},
            "south": {},
            "east":  {},
            "west":  {},
        }

        
    @property
    def north(self) -> int:
        return self._north
    @north.setter
    def north(self, value: int) -> None:
        self._north = value
    
    
    @property
    def south(self) -> int:
        return self._south
    @south.setter
    def south(self, value: int) -> None:
        self._south = value

        
    @property
    def east(self) -> int:
        return self._east
    @east.setter
    def east(self, value: int) -> None:
        self._east = value

        
    @property
    def west(self) -> int:
        return self._west
    @west.setter
    def west(self, value: int) -> None:
        self._west = value

        
    @property
    def history(self) -> dict[ str, dict[datetime,int] ]:
        return self._history
    @history.setter
    def history(self, value: dict[ str, dict[datetime,int] ]) -> None:
        self._history = value
    
    
    def extend_history(self) -> None:
        """
        Extends the current state history dictionary by adding a new key-value pair.
        """
        now = datetime.now()
        self._history["north"][now] = self.north
        self._history["south"][now] = self.south
        self._history["east"][now]  = self.east
        self._history["west"][now]  = self.west
    
    
    def clear_history(self) -> None:
        """
        Clears the state history dictionary.
        """
        self._history = {
            "north": {},
            "south": {},
            "east":  {},
            "west":  {},
        }
    
    
    def get_history(self, pin) -> dict[datetime,int]:
        """
        Gets the sub-dictionary state history of a particular pin.
        
        ## Parameters
            `pin` : The particular pin's state history to get. Can be a `str` or an `int`
        
        ## Returns
        A dictionary of the form:
        ```
        {
            datetime_obj: `pin`'s state,
            datetime_obj: `pin`'s state,
            datetime_obj: `pin`'s state,
            ...
        }
        ```
        """
        if isinstance(pin, int):
            return self._history[{23: "north", 24: "south", 25: "east", 12: "west"}[pin]]
        return self._history[pin]
    
    
    def plot_history(self, pin = None, size: tuple = (8, 6)) -> None:
        """
        Plots the history of either an individual pin's state, or all pin states in a single figure.
        
        ## Parameters
            `pin` (optional) : The particular pin's state history to plot, if any. Can be a `str` or an `int`
            `size` (optional) : The size to make the resulting figure (defaults to 8 x 6)
        """
        plt.figure(figsize=size)
        plt.subplots_adjust(top=0.880, bottom=0.130, left=0.100, right=0.950)
        plt.xlabel("Time", fontsize=14, fontstyle='italic', labelpad=15)
        plt.ylabel("Signal", fontsize=14, fontstyle='italic', labelpad=15)
        plt.yticks([0, 1])
        plt.ylim(-0.1, 1.2)
        times = list(self._history["north"].keys())
        if pin == None:
            plt.title("Signal History", fontsize=18, pad=20)
            for pin in self._history:
                plt.plot(times, list(self.get_history(pin).values()), label=pin)
            plt.legend(loc="upper center", ncol=4, fontsize=10)
        else:
            if isinstance(pin, int):
                pin = {23: "north", 24: "south", 25: "east", 12: "west"}[pin]
            plt.title(f"{pin.title()} Signal History", fontsize=18, pad=20)
            plt.plot(times, list(self.get_history(pin).values()), color={"north": "#1f77b4", "south": "#ff7f0e", "east": "#2ca02c", "west": "#d62728"}[pin])
        plt.show()
        plt.close()
    
    
    def subplot_history(self, size: tuple = (8, 8)) -> None:
        """
        Plots the history of the pin states in a subplot-style plot (4 individual plots in one figure).
        
        ## Parameters
            `size` (optional) : The size to make the subplot figure (defaults to 8 x 8)
        """
        times = list(self._history["north"].keys())
        fig, axes = plt.subplots(nrows=4, ncols=1, sharex=True, figsize=size)
        for pin, ax in zip(self._history, axes):
            ax.set_yticks([0, 1])
            ax.set_ylim(-0.1, 1.1)
            ax.plot(times, list(self.get_history(pin).values()), label=pin, color={"north": "#1f77b4", "south": "#ff7f0e", "east": "#2ca02c", "west": "#d62728"}[pin])
            ax.set_title(pin.title())
            if pin == "west":
                ax.set_xlabel("Time", fontsize=14, fontstyle='italic', labelpad=15)
        fig.subplots_adjust(hspace=0.5, top=0.935, bottom=0.125, left=0.125, right=0.900)
        plt.show()

        
    def __repr__(self) -> str:
        return f"States(north={self.north}, south={self.south}, east={self.east}, west={self.west})"

    
    def __str__(self) -> str:
        return f"States(north={self.north}, south={self.south}, east={self.east}, west={self.west})"

    
    def __iter__(self):
        yield self.north
        yield self.south
        yield self.east
        yield self.west
    
    
    def __getitem__(self, key):
        if key == 0:
            return self.north
        elif key == 1:
            return self.south
        elif key == 2:
            return self.east
        elif key == 3:
            return self.west
        else:
            raise IndexError("States index out of range")
    
    
    def __setitem__(self, key, value):
        if key == 0:
            self.north = value
        elif key == 1:
            self.south = value
        elif key == 2:
            self.east = value
        elif key == 3:
            self.west = value
        else:
            raise IndexError("States index out of range")
