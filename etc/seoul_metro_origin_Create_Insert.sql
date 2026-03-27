# 공공데이터포털 서울교통공사 역별 일별 시간대별 승하차인원 정보
# seoul_metro TABLE CREATE
CREATE TABLE `metro_db`.`seoul_metro_origin`
	(`날짜` VARCHAR(20),
	`역번호` VARCHAR(10),
	`역명` VARCHAR(20),
	`구분` VARCHAR(3) 					COMMENT '승차,하차',
	`05~06` VARCHAR(10) DEFAULT '0',
	`06~07` VARCHAR(10) DEFAULT '0',
	`07~08` VARCHAR(10) DEFAULT '0',
	`08~09` VARCHAR(10) DEFAULT '0',
	`09~10` VARCHAR(10) DEFAULT '0',
	`10~11` VARCHAR(10) DEFAULT '0',
	`11~12` VARCHAR(10) DEFAULT '0',
	`12~13` VARCHAR(10) DEFAULT '0',
	`13~14` VARCHAR(10) DEFAULT '0',
	`14~15` VARCHAR(10) DEFAULT '0',
	`15~16` VARCHAR(10) DEFAULT '0',
	`16~17` VARCHAR(10) DEFAULT '0',
	`17~18` VARCHAR(10) DEFAULT '0',
	`18~19` VARCHAR(10) DEFAULT '0',
	`19~20` VARCHAR(10) DEFAULT '0',
	`20~21` VARCHAR(10) DEFAULT '0',
	`21~22` VARCHAR(10) DEFAULT '0',
	`22~23` VARCHAR(10) DEFAULT '0',
	`23~24` VARCHAR(10) DEFAULT '0',
	`24~25` VARCHAR(10)	DEFAULT '0',   
	`합계` VARCHAR(10)	 DEFAULT '0'
);

# TABLE INSERT 

# 08~16
LOAD DATA LOW_PRIORITY LOCAL INFILE 'D:\\IDE\\Study\\subway\\2008.csv'
IGNORE INTO TABLE `metro_db`.`seoul_metro_origin`
CHARACTER SET euckr
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
 @v날짜, @v역번호, @v역명, @v구분, 
 @v05, @v06, @v07, @v08, @v09, @v10, @v11, @v12, 
 @v13, @v14, @v15, @v16, @v17, @v18, @v19, @v20, 
 @v21, @v22, @v23, @v24
)
SET 
 `날짜`   = TRIM(REPLACE(@v날짜, '"', '')),
 `역번호` = TRIM(REPLACE(@v역번호, '"', '')),
 `역명`   = TRIM(REPLACE(@v역명, '"', '')),
 `구분`   = TRIM(REPLACE(@v구분, '"', '')),
 `05~06` = TRIM(REPLACE(@v05, ',', '')), 
 `06~07` = TRIM(REPLACE(@v06, ',', '')),
 `07~08` = TRIM(REPLACE(@v07, ',', '')),
 `08~09` = TRIM(REPLACE(@v08, ',', '')),
 `09~10` = TRIM(REPLACE(@v09, ',', '')),
 `10~11` = TRIM(REPLACE(@v10, ',', '')),
 `11~12` = TRIM(REPLACE(@v11, ',', '')),
 `12~13` = TRIM(REPLACE(@v12, ',', '')),
 `13~14` = TRIM(REPLACE(@v13, ',', '')),
 `14~15` = TRIM(REPLACE(@v14, ',', '')),
 `15~16` = TRIM(REPLACE(@v15, ',', '')),
 `16~17` = TRIM(REPLACE(@v16, ',', '')),
 `17~18` = TRIM(REPLACE(@v17, ',', '')),
 `18~19` = TRIM(REPLACE(@v18, ',', '')),
 `19~20` = TRIM(REPLACE(@v19, ',', '')),
 `20~21` = TRIM(REPLACE(@v20, ',', '')),
 `21~22` = TRIM(REPLACE(@v21, ',', '')),
 `22~23` = TRIM(REPLACE(@v22, ',', '')),
 `23~24` = TRIM(REPLACE(@v23, ',', '')),
 `24~25` = IFNULL(NULLIF(REPLACE(@v24, ',', ''), ''), 0),
 `합계`  = (`05~06` + `06~07` + `07~08` + `08~09` + `09~10` + `10~11` + 
             `11~12` + `12~13` + `13~14` + `14~15` + `15~16` + `16~17` + 
             `17~18` + `18~19` + `19~20` + `20~21` + `21~22` + `22~23` + 
             `23~24` + `24~25`)
 ;

# 17
LOAD DATA LOW_PRIORITY LOCAL INFILE 'D:\\IDE\\Study\\subway\\2017.csv'
IGNORE INTO TABLE `metro_db`.`seoul_metro_origin`
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
 @v날짜, @v근무구분, @v호선, @v역번호, @v역명, @v구분, 
 @v05, @v06, @v07, @v08, @v09, @v10, @v11, @v12, 
 @v13, @v14, @v15, @v16, @v17, @v18, @v19, @v20, 
 @v21, @v22, @v23, @v24, @v합계
)
SET 
 `날짜`   = TRIM(REPLACE(@v날짜, '"', '')),
 `역번호` = TRIM(REPLACE(@v역번호, '"', '')),
 `역명`   = TRIM(REPLACE(@v역명, '"', '')),
 `구분`   = TRIM(REPLACE(@v구분, '"', '')),
 `05~06` = TRIM(REPLACE(@v05, ',', '')), 
 `06~07` = TRIM(REPLACE(@v06, ',', '')),
 `07~08` = TRIM(REPLACE(@v07, ',', '')),
 `08~09` = TRIM(REPLACE(@v08, ',', '')),
 `09~10` = TRIM(REPLACE(@v09, ',', '')),
 `10~11` = TRIM(REPLACE(@v10, ',', '')),
 `11~12` = TRIM(REPLACE(@v11, ',', '')),
 `12~13` = TRIM(REPLACE(@v12, ',', '')),
 `13~14` = TRIM(REPLACE(@v13, ',', '')),
 `14~15` = TRIM(REPLACE(@v14, ',', '')),
 `15~16` = TRIM(REPLACE(@v15, ',', '')),
 `16~17` = TRIM(REPLACE(@v16, ',', '')),
 `17~18` = TRIM(REPLACE(@v17, ',', '')),
 `18~19` = TRIM(REPLACE(@v18, ',', '')),
 `19~20` = TRIM(REPLACE(@v19, ',', '')),
 `20~21` = TRIM(REPLACE(@v20, ',', '')),
 `21~22` = TRIM(REPLACE(@v21, ',', '')),
 `22~23` = TRIM(REPLACE(@v22, ',', '')),
 `23~24` = TRIM(REPLACE(@v23, ',', '')),
 `24~25` = IFNULL(NULLIF(REPLACE(@v24, ',', ''), ''), 0),
 `합계`  = (`05~06` + `06~07` + `07~08` + `08~09` + `09~10` + `10~11` + 
             `11~12` + `12~13` + `13~14` + `14~15` + `15~16` + `16~17` + 
             `17~18` + `18~19` + `19~20` + `20~21` + `21~22` + `22~23` + 
             `23~24` + `24~25`)
 ;

# 18, 19
LOAD DATA LOW_PRIORITY LOCAL INFILE 'D:\\IDE\\Study\\subway\\2019.csv'
IGNORE INTO TABLE `metro_db`.`seoul_metro_origin`
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
 @v날짜, @v호선, @v역번호, @v역명, @v구분, 
 @v05, @v06, @v07, @v08, @v09, @v10, @v11, @v12, 
 @v13, @v14, @v15, @v16, @v17, @v18, @v19, @v20, 
 @v21, @v22, @v23, @v24, @v합계
)
SET 
 `날짜`   = TRIM(REPLACE(@v날짜, '"', '')),
 `역번호` = TRIM(REPLACE(@v역번호, '"', '')),
 `역명`   = TRIM(REPLACE(@v역명, '"', '')),
 `구분`   = TRIM(REPLACE(@v구분, '"', '')),
 `05~06` = TRIM(REPLACE(@v05, ',', '')), 
 `06~07` = TRIM(REPLACE(@v06, ',', '')),
 `07~08` = TRIM(REPLACE(@v07, ',', '')),
 `08~09` = TRIM(REPLACE(@v08, ',', '')),
 `09~10` = TRIM(REPLACE(@v09, ',', '')),
 `10~11` = TRIM(REPLACE(@v10, ',', '')),
 `11~12` = TRIM(REPLACE(@v11, ',', '')),
 `12~13` = TRIM(REPLACE(@v12, ',', '')),
 `13~14` = TRIM(REPLACE(@v13, ',', '')),
 `14~15` = TRIM(REPLACE(@v14, ',', '')),
 `15~16` = TRIM(REPLACE(@v15, ',', '')),
 `16~17` = TRIM(REPLACE(@v16, ',', '')),
 `17~18` = TRIM(REPLACE(@v17, ',', '')),
 `18~19` = TRIM(REPLACE(@v18, ',', '')),
 `19~20` = TRIM(REPLACE(@v19, ',', '')),
 `20~21` = TRIM(REPLACE(@v20, ',', '')),
 `21~22` = TRIM(REPLACE(@v21, ',', '')),
 `22~23` = TRIM(REPLACE(@v22, ',', '')),
 `23~24` = TRIM(REPLACE(@v23, ',', '')),
 `24~25` = IFNULL(NULLIF(REPLACE(@v24, ',', ''), ''), 0),
 `합계`  = (`05~06` + `06~07` + `07~08` + `08~09` + `09~10` + `10~11` + 
             `11~12` + `12~13` + `13~14` + `14~15` + `15~16` + `16~17` + 
             `17~18` + `18~19` + `19~20` + `20~21` + `21~22` + `22~23` + 
             `23~24` + `24~25`)
 ;

# 20
LOAD DATA LOW_PRIORITY LOCAL INFILE 'D:\\IDE\\Study\\subway\\2020.csv'
IGNORE INTO TABLE `metro_db`.`seoul_metro_origin`
CHARACTER SET euckr
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
 @v날짜, @v호선, @v역번호, @v역명, @v구분, 
 @v05, @v06, @v07, @v08, @v09, @v10, @v11, @v12, 
 @v13, @v14, @v15, @v16, @v17, @v18, @v19, @v20, 
 @v21, @v22, @v23, @v24
)
SET 
 `날짜`   = TRIM(REPLACE(@v날짜, '"', '')),
 `역번호` = TRIM(REPLACE(@v역번호, '"', '')),
 `역명`   = TRIM(REPLACE(@v역명, '"', '')),
 `구분`   = TRIM(REPLACE(@v구분, '"', '')),
 `05~06` = TRIM(REPLACE(@v05, ',', '')), 
 `06~07` = TRIM(REPLACE(@v06, ',', '')),
 `07~08` = TRIM(REPLACE(@v07, ',', '')),
 `08~09` = TRIM(REPLACE(@v08, ',', '')),
 `09~10` = TRIM(REPLACE(@v09, ',', '')),
 `10~11` = TRIM(REPLACE(@v10, ',', '')),
 `11~12` = TRIM(REPLACE(@v11, ',', '')),
 `12~13` = TRIM(REPLACE(@v12, ',', '')),
 `13~14` = TRIM(REPLACE(@v13, ',', '')),
 `14~15` = TRIM(REPLACE(@v14, ',', '')),
 `15~16` = TRIM(REPLACE(@v15, ',', '')),
 `16~17` = TRIM(REPLACE(@v16, ',', '')),
 `17~18` = TRIM(REPLACE(@v17, ',', '')),
 `18~19` = TRIM(REPLACE(@v18, ',', '')),
 `19~20` = TRIM(REPLACE(@v19, ',', '')),
 `20~21` = TRIM(REPLACE(@v20, ',', '')),
 `21~22` = TRIM(REPLACE(@v21, ',', '')),
 `22~23` = TRIM(REPLACE(@v22, ',', '')),
 `23~24` = TRIM(REPLACE(@v23, ',', '')),
 `24~25` = IFNULL(NULLIF(REPLACE(@v24, ',', ''), ''), 0),
 `합계`  = (`05~06` + `06~07` + `07~08` + `08~09` + `09~10` + `10~11` + 
             `11~12` + `12~13` + `13~14` + `14~15` + `15~16` + `16~17` + 
             `17~18` + `18~19` + `19~20` + `20~21` + `21~22` + `22~23` + 
             `23~24` + `24~25`)
 ;

# 21
LOAD DATA LOW_PRIORITY LOCAL INFILE 'D:\\IDE\\Study\\subway\\2021.csv'
IGNORE INTO TABLE `metro_db`.`seoul_metro_origin`
CHARACTER SET euckr
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
 @v연번, @v날짜, @v호선, @v역번호, @v역명, @v구분, 
 @v05, @v06, @v07, @v08, @v09, @v10, @v11, @v12, 
 @v13, @v14, @v15, @v16, @v17, @v18, @v19, @v20, 
 @v21, @v22, @v23, @v합계
)
SET 
 `날짜`   = TRIM(REPLACE(@v날짜, '"', '')),
 `역번호` = TRIM(REPLACE(@v역번호, '"', '')),
 `역명`   = TRIM(REPLACE(@v역명, '"', '')),
 `구분`   = TRIM(REPLACE(@v구분, '"', '')),
 `05~06` = TRIM(REPLACE(@v05, ',', '')), 
 `06~07` = TRIM(REPLACE(@v06, ',', '')),
 `07~08` = TRIM(REPLACE(@v07, ',', '')),
 `08~09` = TRIM(REPLACE(@v08, ',', '')),
 `09~10` = TRIM(REPLACE(@v09, ',', '')),
 `10~11` = TRIM(REPLACE(@v10, ',', '')),
 `11~12` = TRIM(REPLACE(@v11, ',', '')),
 `12~13` = TRIM(REPLACE(@v12, ',', '')),
 `13~14` = TRIM(REPLACE(@v13, ',', '')),
 `14~15` = TRIM(REPLACE(@v14, ',', '')),
 `15~16` = TRIM(REPLACE(@v15, ',', '')),
 `16~17` = TRIM(REPLACE(@v16, ',', '')),
 `17~18` = TRIM(REPLACE(@v17, ',', '')),
 `18~19` = TRIM(REPLACE(@v18, ',', '')),
 `19~20` = TRIM(REPLACE(@v19, ',', '')),
 `20~21` = TRIM(REPLACE(@v20, ',', '')),
 `21~22` = TRIM(REPLACE(@v21, ',', '')),
 `22~23` = TRIM(REPLACE(@v22, ',', '')),
 `23~24` = TRIM(REPLACE(@v23, ',', '')),
 `24~25` = IFNULL(NULLIF(REPLACE(@v24, ',', ''), ''), 0),
 `합계`  = (`05~06` + `06~07` + `07~08` + `08~09` + `09~10` + `10~11` + 
             `11~12` + `12~13` + `13~14` + `14~15` + `15~16` + `16~17` + 
             `17~18` + `18~19` + `19~20` + `20~21` + `21~22` + `22~23` + 
             `23~24` + `24~25`)
 ;

# 22
LOAD DATA LOW_PRIORITY LOCAL INFILE 'D:\\IDE\\Study\\subway\\2022.csv'
IGNORE INTO TABLE `metro_db`.`seoul_metro_origin`
CHARACTER SET euckr
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
 @v연번, @v날짜, @v호선, @v역번호, @v역명, @v구분, 
 @v05, @v06, @v07, @v08, @v09, @v10, @v11, @v12, 
 @v13, @v14, @v15, @v16, @v17, @v18, @v19, @v20, 
 @v21, @v22, @v23, @v24
)
SET 
 `날짜`   = TRIM(REPLACE(@v날짜, '"', '')),
 `역번호` = TRIM(REPLACE(@v역번호, '"', '')),
 `역명`   = TRIM(REPLACE(@v역명, '"', '')),
 `구분`   = TRIM(REPLACE(@v구분, '"', '')),
 `05~06` = TRIM(REPLACE(@v05, ',', '')), 
 `06~07` = TRIM(REPLACE(@v06, ',', '')),
 `07~08` = TRIM(REPLACE(@v07, ',', '')),
 `08~09` = TRIM(REPLACE(@v08, ',', '')),
 `09~10` = TRIM(REPLACE(@v09, ',', '')),
 `10~11` = TRIM(REPLACE(@v10, ',', '')),
 `11~12` = TRIM(REPLACE(@v11, ',', '')),
 `12~13` = TRIM(REPLACE(@v12, ',', '')),
 `13~14` = TRIM(REPLACE(@v13, ',', '')),
 `14~15` = TRIM(REPLACE(@v14, ',', '')),
 `15~16` = TRIM(REPLACE(@v15, ',', '')),
 `16~17` = TRIM(REPLACE(@v16, ',', '')),
 `17~18` = TRIM(REPLACE(@v17, ',', '')),
 `18~19` = TRIM(REPLACE(@v18, ',', '')),
 `19~20` = TRIM(REPLACE(@v19, ',', '')),
 `20~21` = TRIM(REPLACE(@v20, ',', '')),
 `21~22` = TRIM(REPLACE(@v21, ',', '')),
 `22~23` = TRIM(REPLACE(@v22, ',', '')),
 `23~24` = TRIM(REPLACE(@v23, ',', '')),
 `24~25` = IFNULL(NULLIF(REPLACE(@v24, ',', ''), ''), 0),
 `합계`  = (`05~06` + `06~07` + `07~08` + `08~09` + `09~10` + `10~11` + 
             `11~12` + `12~13` + `13~14` + `14~15` + `15~16` + `16~17` + 
             `17~18` + `18~19` + `19~20` + `20~21` + `21~22` + `22~23` + 
             `23~24` + `24~25`)
;
 
# 23
LOAD DATA LOW_PRIORITY LOCAL INFILE 'D:\\IDE\\Study\\subway\\2023.csv'
IGNORE INTO TABLE `metro_db`.`seoul_metro_origin`
CHARACTER SET euckr
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
 @v연번, @v날짜, @v호선, @v역번호, @v역명, @v구분, 
 @v05, @v06, @v07, @v08, @v09, @v10, @v11, @v12, 
 @v13, @v14, @v15, @v16, @v17, @v18, @v19, @v20, 
 @v21, @v22, @v23, @v24
)
SET 
 `날짜`   = TRIM(REPLACE(@v날짜, '"', '')),
 `역번호` = TRIM(REPLACE(@v역번호, '"', '')),
 `역명`   = TRIM(REPLACE(@v역명, '"', '')),
 `구분`   = TRIM(REPLACE(@v구분, '"', '')),
 `05~06` = TRIM(REPLACE(@v05, ',', '')), 
 `06~07` = TRIM(REPLACE(@v06, ',', '')),
 `07~08` = TRIM(REPLACE(@v07, ',', '')),
 `08~09` = TRIM(REPLACE(@v08, ',', '')),
 `09~10` = TRIM(REPLACE(@v09, ',', '')),
 `10~11` = TRIM(REPLACE(@v10, ',', '')),
 `11~12` = TRIM(REPLACE(@v11, ',', '')),
 `12~13` = TRIM(REPLACE(@v12, ',', '')),
 `13~14` = TRIM(REPLACE(@v13, ',', '')),
 `14~15` = TRIM(REPLACE(@v14, ',', '')),
 `15~16` = TRIM(REPLACE(@v15, ',', '')),
 `16~17` = TRIM(REPLACE(@v16, ',', '')),
 `17~18` = TRIM(REPLACE(@v17, ',', '')),
 `18~19` = TRIM(REPLACE(@v18, ',', '')),
 `19~20` = TRIM(REPLACE(@v19, ',', '')),
 `20~21` = TRIM(REPLACE(@v20, ',', '')),
 `21~22` = TRIM(REPLACE(@v21, ',', '')),
 `22~23` = TRIM(REPLACE(@v22, ',', '')),
 `23~24` = TRIM(REPLACE(@v23, ',', '')),
 `24~25` = IFNULL(NULLIF(REPLACE(@v24, ',', ''), ''), 0),
 `합계`  = (`05~06` + `06~07` + `07~08` + `08~09` + `09~10` + `10~11` + 
             `11~12` + `12~13` + `13~14` + `14~15` + `15~16` + `16~17` + 
             `17~18` + `18~19` + `19~20` + `20~21` + `21~22` + `22~23` + 
             `23~24` + `24~25`)
 ;
 
# 24
LOAD DATA LOW_PRIORITY LOCAL INFILE 'D:\\IDE\\Study\\subway\\2024.csv'
IGNORE INTO TABLE `metro_db`.`seoul_metro_origin`
CHARACTER SET euckr
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
 @v연번, @v날짜, @v호선, @v역번호, @v역명, @v구분, 
 @v05, @v06, @v07, @v08, @v09, @v10, @v11, @v12, 
 @v13, @v14, @v15, @v16, @v17, @v18, @v19, @v20, 
 @v21, @v22, @v23, @v24
)
SET 
 `날짜`   = TRIM(REPLACE(@v날짜, '"', '')),
 `역번호` = TRIM(REPLACE(@v역번호, '"', '')),
 `역명`   = TRIM(REPLACE(@v역명, '"', '')),
 `구분`   = TRIM(REPLACE(@v구분, '"', '')),
 `05~06` = TRIM(REPLACE(@v05, ',', '')), 
 `06~07` = TRIM(REPLACE(@v06, ',', '')),
 `07~08` = TRIM(REPLACE(@v07, ',', '')),
 `08~09` = TRIM(REPLACE(@v08, ',', '')),
 `09~10` = TRIM(REPLACE(@v09, ',', '')),
 `10~11` = TRIM(REPLACE(@v10, ',', '')),
 `11~12` = TRIM(REPLACE(@v11, ',', '')),
 `12~13` = TRIM(REPLACE(@v12, ',', '')),
 `13~14` = TRIM(REPLACE(@v13, ',', '')),
 `14~15` = TRIM(REPLACE(@v14, ',', '')),
 `15~16` = TRIM(REPLACE(@v15, ',', '')),
 `16~17` = TRIM(REPLACE(@v16, ',', '')),
 `17~18` = TRIM(REPLACE(@v17, ',', '')),
 `18~19` = TRIM(REPLACE(@v18, ',', '')),
 `19~20` = TRIM(REPLACE(@v19, ',', '')),
 `20~21` = TRIM(REPLACE(@v20, ',', '')),
 `21~22` = TRIM(REPLACE(@v21, ',', '')),
 `22~23` = TRIM(REPLACE(@v22, ',', '')),
 `23~24` = TRIM(REPLACE(@v23, ',', '')),
 `24~25` = IFNULL(NULLIF(REPLACE(@v24, ',', ''), ''), 0),
 `합계`  = (`05~06` + `06~07` + `07~08` + `08~09` + `09~10` + `10~11` + 
             `11~12` + `12~13` + `13~14` + `14~15` + `15~16` + `16~17` + 
             `17~18` + `18~19` + `19~20` + `20~21` + `21~22` + `22~23` + 
             `23~24` + `24~25`)
 ;