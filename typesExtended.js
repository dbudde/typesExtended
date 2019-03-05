(function(undefined)
{
	var keyExists = null,
		methodAdd = null,
		methodExists = null;



	/*
	 * Determines if an object contains a specific key.
	 */
	keyExists = function(obj, key)
	{
		if (typeof obj[key] === "undefined" || obj[key] === null)
		{
			return false;
		}

		return true;
	};


	/*
	 * This adds a method to a primitive data type either as a class static method, instance method, or both.
	 * 
	 * @primitive -	The primitive to extend.
	 * @name -		The name of the method.
	 * @method -	The actual method to add.
	 * @scope -		The scope to add to. (static, instance, both)
	 * 					static - Add to the base primitive definition as a static method.
	 * 					instance - Add to an instance of the primitive only.
	 */
	methodAdd = function(primitive, name, method, scope)
	{
		var i = 0,
			names = name.split(",");

		if (typeof scope === "undefined" || scope === null)
		{
			scope = "instance";
		}


		// Handle comma seperated list of names.
		if (names.length > 1)
		{
			for (i = 0; i < names.length; i++)
			{
				methodAdd(primitive, names[i], method, scope);
			}
		}
		else
		{
			if ((scope === "static" || scope === "both") && !methodExists(primitive, name, "static"))
			{
				primitive[name] = method;
			}

			if ((scope === "instance" || scope === "both") && !methodExists(primitive, name, "instance"))
			{
				primitive.prototype[name] = method;
			}
		}
	};


	methodExists = function(primitive, name, scope)
	{
		var base = primitive;

		if (scope === "instance")
		{
			base = primitive.prototype;
		}

		if (keyExists(base, name))
		{
			return true;
		}

		return false;
	};




	// BOOLEAN Extension
	methodAdd(
		Boolean,
		"toBoolean",
		function(value)
		{
			var stringValue = String(value).toLowerCase();

			switch(stringValue)
			{
				case "true": case "yes": case "1": return true;
				case "false": case "no": case "0": return false;
				default: return Boolean(stringValue);
			}
		},
		"static"
	);




	// DATE Extension
	methodAdd(
		Date,
		"add",
		function(datePart, amount)
		{
			var milliseconds = 1000;

			// milliseconds
			if (datePart === "ms" || datePart === "l" || datePart === "milli" || datePart === "millisecond")
			{
				this.setTime(this.getTime() + amount);
				return;
			}


			// seconds
			if (datePart === "s" || datePart === "sec" || datePart === "second")
			{
				this.setTime(this.getTime() + (milliseconds * amount));
				return;
			}


			milliseconds *= 60;

			// minutes
			if (datePart === "n" || datePart === "min" || datePart === "minute")
			{
				this.setTime(this.getTime() + (milliseconds * amount));
				return;
			}


			milliseconds *= 60;

			// hours
			if (datePart === "h" || datePart === "hour")
			{
				this.setTime(this.getTime() + (milliseconds * amount));
				return;
			}


			milliseconds *= 24;

			// days
			if (datePart === "d" || datePart === "day")
			{
				this.setTime(this.getTime() + (milliseconds * amount));
				return;
			}


			milliseconds *= 7;

			// weeks
			if (datePart === "w" || datePart === "week")
			{
				this.setTime(this.getTime() + (milliseconds * amount));
				return;
			}


			// months
			if (datePart === "m" || datePart === "mon" || datePart === "month")
			{
				var increment = 1,
					day = this.getDate(),
					month = this.getMonth() + 1,
					originalDay = this.getDate(),
					year = this.getFullYear();

				if (amount < 0)
				{
					amount = Math.abs(amount);
					increment = -1;
				}

				for (var i = 0; i < amount; i++)
				{
					month += increment;

					if (increment === -1 && month === 0)
					{
						month = 12;
						year--;
					}
					else if (month === 13)
					{
						month = 1;
						year++;
					}
				}

				if (originalDay > this.daysInMonth(year, month - 1))
				{
					day = this.daysInMonth(year, month - 1);
				}

				this.setDate(day);
				this.setMonth(month - 1);
				this.setFullYear(year);
				return;
			}


			// years
			if (datePart === "y" || datePart === "yyyy" || datePart === "year")
			{
				this.setFullYear(this.getFullYear() + amount);
				return;
			}
		}
	);	


	methodAdd(Date, "addDays", function(days) { this.setDate(this.getDate() + days); });


	methodAdd(
		Date,
		"convertToDate",
		function(dateString)
		{
			var date = dateString,
				dateCompare,
				dtString = dateString,
				isDate = false;


			// Check to see if conversion is even needed.
			if (!Date.isDate(date) && typeof dateString === "string" && (dateString.indexOf("-") < 0 || (dateString.indexOf("-") > -1 && dateString.indexOf(":") > -1)))
			{
				date = Date.parse(date);
			}


			if (!Date.isDate(date) && typeof dateString === "string" && (dateString.indexOf("-") < 0 || (dateString.indexOf("-") > -1 && dateString.indexOf(":") > -1)))
			{
				date = new Date(date);
			}


			// Perform initial check and attempt conversion for date/time.
			if (!Date.isDate(date) && typeof dateString === "string")
			{
				if (dtString.indexOf(":") == -1)
				{
					dtString += " 00:00:00";
				}

				dateCompare = dtString.replace(/\-/g, " ").replace(/\:/g, " ");
				dateCompare = dateCompare.split(" ");


				if (dateCompare.length === 6 && dateCompare.join("").length === dateCompare.join("").replace(/\D/g, "").length)
				{
					date = new Date();
					date.setDateTime(dateString);


					if (dtString !== date.formatDateTime() && dtString !== date.formatDate("yyyy-m-d") + " " + date.formatTime("HH:nn:ss"))
					{
						date = null;
					}
					else
					{
						isDate = true;
					}
				}
			}


			if (!Date.isDate(date) && typeof dateString === "string")
			{
				// Correction for missing time
				if (dateString.indexOf(":") == -1)
				{
					date = new Date(dateString + " 00:00:00");
				}
				else
				{
					date = new Date(dateString);
				}
			}


			if (!Date.isDate(date))
			{
				date = dateString;
			}


			return date;
		},
		"both"
	);	


	methodAdd(
		Date,
		"dateDiff,diff",
		function(datePart, date)
		{
			if (
					datePart != "ms" && datePart != "s" && 
					datePart != "n" && datePart != "h" && 
					datePart != "d" && datePart != "w" && 
					datePart != "m" && datePart != "yyyy"
				)
			{
				datePart = "d";
			}


			if (typeof date === "undefined" || date === null)
			{
				date = new Date();	
			}


			var millisecondDiff = Math.abs(this.getTime() - date.getTime());

			if (datePart === "ms" || datePart === "l" || datePart === "milli" || datePart === "millisecond")
			{
				return millisecondDiff;
			}


			var secondDiff = Math.floor(millisecondDiff / 1000);

			if (datePart === "s" || datePart === "sec" || datePart === "second")
			{
				return secondDiff;
			}


			var minuteDiff = Math.floor(secondDiff / 60);

			if (datePart === "n" || datePart === "min" || datePart === "minute")
			{
				return minuteDiff;
			}


			var hourDiff = Math.floor(minuteDiff / 60);

			if (datePart === "h" || datePart === "hour")
			{
				return hourDiff;
			}


			var dayDiff = Math.floor(hourDiff / 24);

			if (datePart === "d" || datePart === "day")
			{
				return dayDiff;
			}


			var weekDiff = Math.floor(dayDiff / 7);

			if (datePart === "w" || datePart === "week")
			{
				return weekDiff;
			}


			if (datePart === "m" || datePart === "mon" || datePart === "month")
			{
				var highDate = new Date(this);
				var lowDate =  new Date(date);
				var counter = -1;

				if (this.getTime() < date.getTime())
				{
					highDate = new Date(date);
					lowDate = new Date(this);
				}

				while (highDate.getTime() >= lowDate.getTime())
				{
					var month = highDate.getMonth();
					var year = highDate.getFullYear();
					month--;

					if (month === -1)
					{
						month = 11;
						year--;
					}

					highDate.setMonth(month);
					highDate.setFullYear(year);

					counter++;
				}

				return counter;
			}


			if (datePart === "y" || datePart === "yyyy" || datePart === "year")
			{
				var highDate = new Date(this);
				var lowDate =  new Date(date);
				var counter = -1;

				if (this.getTime() < date.getTime())
				{
					highDate = new Date(date);
					lowDate = new Date(this);
				}

				while (highDate.getTime() >= lowDate.getTime())
				{
					var year = highDate.getFullYear();
					year--;

					highDate.setFullYear(year);

					counter++;
				}

				return counter;
			}


			return 0;
		}
	);	


	methodAdd(Date, "day", function() { return this.getDate(); });
	methodAdd(Date, "dayOfWeek", function() { return this.getDay() + 1; });


	methodAdd(
		Date,
		"dayOfWeekAsString",
		function(dayOfWeek, abbreviate)
		{
			if (typeof abbreviate === "undefined" || abbreviate == null)
			{
				abbreviate = false;	
			}

			if (typeof dayOfWeek === "undefined" || dayOfWeek == null)
			{
				dayOfWeek = this.dayOfWeek();	
			}


			switch (dayOfWeek)
			{
				case 7:
					if (abbreviate)
					{
						return "Sat";
					}
					else
					{
						return "Saturday";
					}

				case 6:
					if (abbreviate)
					{
						return "Fri";
					}
					else
					{
						return "Friday";
					}

				case 5:
					if (abbreviate)
					{
						return "Thu";
					}
					else
					{
						return "Thursday";
					}

				case 4:
					if (abbreviate)
					{
						return "Wed";
					}
					else
					{
						return "Wednesday";
					}

				case 3:
					if (abbreviate)
					{
						return "Tue";
					}
					else
					{
						return "Tuesday";
					}

				case 2:
					if (abbreviate)
					{
						return "Mon";
					}
					else
					{
						return "Monday";
					}

				default:
					if (abbreviate)
					{
						return "Sun";
					}
					else
					{
						return "Sunday";
					}
			}
		}
	);


	methodAdd(
		Date,
		"dayOfYear",
		function()
		{
			var date = new Date(this.getTime()),
				total = 0;

			if (date.month() > 1)
			{
				date.add("m", -1);
			}

			while(date.month() > 1)
			{
				total += date.daysInMonth();
				date.add("m", -1);
			}

			if (this.month() != 1)
			{
				total += date.daysInMonth();
			}

			total += this.day();

			return total;
		}
	);


	methodAdd(
		Date,
		"daysInMonth",
		function(year, month)
		{
			if (typeof year === "undefined" || year == null)
			{
				year = this.getFullYear();	
			}

			if (typeof month === "undefined" || month == null)
			{
				month = this.getMonth();	
			}

			return 32 - new Date(year, month, 32).getDate();
		}
	);


	methodAdd(
		Date,
		"daySuffix",
		function()
		{
			var suffix = "th";

			switch(this.day())
			{
				case 1:
				case 21:
				case 31:
					suffix = "st";
					break;

				case 2:
				case 22:
					suffix = "nd";
					break;

				case 3:
				case 23:
					suffix = "rd";
					break;
			}

			return suffix;
		}
	);


	methodAdd(
		Date,
		"formatDate",
		function(mask)
		{
			// DATE FORMAT
			var day = String(this.day());

			if (day.length == 1)
			{
				day = "0" + day;	
			}


			var month = String(this.month());

			if (month.length == 1)
			{
				month = "0" + month;
			}


			// Replace Day Patterns
			mask = mask.replace(/S/g, this.daySuffix());

			mask = mask.replace(/dddd/g, this.dayOfWeekAsString(this.dayOfWeek()));
			mask = mask.replace(/ddd/g, this.dayOfWeekAsString(this.dayOfWeek(), true));
			mask = mask.replace(/D/g, this.dayOfWeekAsString(this.dayOfYear(), true));
			mask = mask.replace(/dd/g, day);
			mask = mask.replace(/d/g, this.day());
			mask = mask.replace(/j/g, this.day());


			// Replace Month Patterns
			mask = mask.replace(/mmmm/g, this.monthAsString());
			mask = mask.replace(/F/g, this.monthAsString());
			mask = mask.replace(/mmm/g, this.monthAsString(null, true));
			mask = mask.replace(/M/g, this.monthAsString(null, true));
			mask = mask.replace(/mm/g, month);
			mask = mask.replace(/m/g, this.month());


			// Replace Year Patterns
			mask = mask.replace(/yyyy/g, this.year());
			mask = mask.replace(/yy/g, String(this.year()).substring(2, 4));


			return mask;
		}
	);


	methodAdd(
		Date, 
		"format,formatDateTime", 
		function(mask)
		{
			if (typeof mask === "undefined" || mask === null)
			{
				mask = "yyyy-mm-dd HH:mm:ss";
			}

			mask = this.formatDate(mask);

			return this.formatTime(mask);
		}
	);


	methodAdd(
		Date,
		"formatTime",
		function(mask)
		{
			var hour24 = String(this.hour()),
				hourLabel = "AM",
				hourShortLabel = "A";

			if (hour24.length == 1)
			{
				hour24 = "0" + hour24;
			}


			var hour = String(this.hour(false));

			if (hour.length == 1)
			{
				hour = "0" + hour;
			}


			var minute = String(this.minute());

			if (minute.length == 1)
			{
				minute = "0" + minute;
			}


			var second = String(this.second());

			if (second.length == 1)
			{
				second = "0" + second;
			}


			if (this.hour() >= 12)
			{
				hourLabel = "PM";
				hourShortLabel = "P";
			}


			// Replace Hour Patterns
			mask = mask.replace(/hh/g, hour);
			mask = mask.replace(/h/g, this.hour(false));
			mask = mask.replace(/HH/g, hour24);
			mask = mask.replace(/H/g, this.hour());
			mask = mask.replace(/G/g, this.hour());


			// Replace Minute Patterns
			mask = mask.replace(/mm/g, minute);
			mask = mask.replace(/m/g, this.minute());
			mask = mask.replace(/nn/g, minute);
			mask = mask.replace(/n/g, this.minute());


			// Replace Second Patterns
			mask = mask.replace(/ss/g, second);
			mask = mask.replace(/s/g, this.second());


			// Replace Milliseconds Patterns
			mask = mask.replace(/l/g, this.millisecond());


			// Replace Hour Label Patterns
			mask = mask.replace(/tt/g, hourLabel);
			mask = mask.replace(/A/g, hourLabel);
			mask = mask.replace(/a/g, hourLabel.toLowerCase());
			mask = mask.replace(/t/g, hourShortLabel);


			return mask;
		}
	);


	methodAdd(
		Date,
		"hour",
		function(twentyFourHour)
		{
			if (typeof twentyFourHour === "undefined" || twentyFourHour == null)
			{
				twentyFourHour = true;	
			}


			if (twentyFourHour)
			{
				return this.getHours();
			}
			else
			{
				var hour = this.getHours();

				if (hour == 0)
				{
					hour = 12;	
				}
				else if (hour >= 13)
				{
					hour = hour - 12;	
				}

				return hour;
			}
		}
	);


	methodAdd(Date, "isDate", function(date) { return date instanceof Date && !isNaN(date.valueOf()); }, "both");
	methodAdd(Date, "millisecond", function() { return this.getMilliseconds(); });
	methodAdd(Date, "minute", function() { return this.getMinutes(); });
	methodAdd(Date, "month", function() { return this.getMonth() + 1; });


	methodAdd(
		Date,
		"monthAsString",
		function(month, abbreviate)
		{
			if (typeof month === "undefined" || month == null || Number(month) < 1 || Number(month) > 12)
			{
				month = this.month();	
			}

			if (typeof abbreviate === "undefined" || abbreviate == null)
			{
				abbreviate = false;	
			}


			switch (month)
			{
				case 12:
					if (abbreviate)
					{
						return "Dec";
					}
					else
					{
						return "December";
					}

				case 11:
					if (abbreviate)
					{
						return "Nov";
					}
					else
					{
						return "November";
					}

				case 10:
					if (abbreviate)
					{
						return "Oct";
					}
					else
					{
						return "October";
					}

				case 9:
					if (abbreviate)
					{
						return "Sep";
					}
					else
					{
						return "September";
					}

				case 8:
					if (abbreviate)
					{
						return "Aug";
					}
					else
					{
						return "August";
					}

				case 7:
					if (abbreviate)
					{
						return "Jul";
					}
					else
					{
						return "July";
					}

				case 6:
					if (abbreviate)
					{
						return "Jun";
					}
					else
					{
						return "June";
					}

				case 5:
					if (abbreviate)
					{
						return "May";
					}
					else
					{
						return "May";
					}

				case 4:
					if (abbreviate)
					{
						return "Apr";
					}
					else
					{
						return "April";
					}

				case 3:
					if (abbreviate)
					{
						return "Mar";
					}
					else
					{
						return "March";
					}

				case 2:
					if (abbreviate)
					{
						return "Feb";
					}
					else
					{
						return "February";
					}

				default:
					if (abbreviate)
					{
						return "Jan";
					}
					else
					{
						return "January";
					}
			}
		}
	);


	methodAdd(Date, "second", function() { return this.getSeconds(); });


	// Fix for older IE and Safari not parsing datetime format.
	methodAdd(
		Date,
		"setDateTime",
		function(datetime)
		{
			var date = datetime.split(" "),
				day,
				hour,
				millisecond = 0,
				minute,
				month,
				second,
				time,
				timeSegments,
				year;


			if (date.length === 2)
			{
				// Handle date and time - flipped setting order so that date is not overwritten before time is set
				time = date[1];
				date = date[0];
			}
			else if (date.length === 1)
			{
				// Handle date only
				date = date[0];
				time = "00:00:00";
			}


			date = date.split("-");
			time = time.split(":");


			if (date.length === 3)
			{
				if (date[0].length === date[0].replace(/\D/g, "").length)
				{
					year = date[0];
				}

				if (date[1].length === date[1].replace(/\D/g, "").length)
				{
					month = date[1];
				}

				if (date[2].length === date[2].replace(/\D/g, "").length)
				{
					day = date[2];
				}
			}


			if (time.length === 3)
			{
				// Handle if millisecond is present.
				if (time[2].indexOf(".") > -1)
				{
					timeSegments = time[2].split(".");
					time[2] = timeSegments[0];

					millisecond = Number(timeSegments[1]);
				}


				if (time[0].length === time[0].replace(/\D/g, "").length)
				{
					hour = time[0];
				}

				if (time[1].length === time[1].replace(/\D/g, "").length)
				{
					minute = time[1];
				}

				if (time[2].length === time[2].replace(/\D/g, "").length)
				{
					second = time[2];
				}
			}


			if (year != null && month != null && day != null && hour != null && minute != null && second != null)
			{
				this.setFullYear(year);
				this.setMonth(Number(month) - 1);
				this.setDate(day);
				this.setHours(hour);
				this.setMinutes(minute);
				this.setSeconds(second);
				this.setMilliseconds(millisecond);
			}
		}
	);


	methodAdd(Date, "year", function() { return this.getFullYear(); });




	// NUMBER Extension
	methodAdd(
		Number, 
		"randomNumber", 
		function(minValue, maxValue, decimals) 
		{
			var number = minValue + (Math.random() * (maxValue - minValue));

			if (typeof decimals === "undefined" || decimals === null || decimals !== Number(decimals) || decimals < 0)
			{
				decimals = 0;
			}

			return typeof floatVal == "undefined" ? Math.round(number) : number.toFixed(decimals);
		}, 
		"static"
	);

	methodAdd(Number, "roundToDecimal", function(decimals) { return (Math.round(this * Math.pow(10, decimals)) / Math.pow(10, decimals)); });




	// STRING Extension
	methodAdd(String, "insert", function(insertValue, position) { return this.substr(0, position) + insertValue + this.substr(position); });
	methodAdd(String, "left", function(count) { return this.substr(0, count); });
	methodAdd(String, "repeat,repeatString", function(repeat) { return Array(parseInt(repeat) + 1).join(this); });
	methodAdd(String, "right", function(count) { return this.substr(this.length - count, count); });
	methodAdd(String, "trim", function() { return this.replace(/^\s*/, "").replace(/\s*$/, ""); });


}(undefined));