#ifndef HELPER_TS_H
#define HELPER_TS_H

#include <string>

///
/// \brief help Принимает flexbuffers vector проходится по нему и возвращет массив json
/// где первый объект это хендл атрибута1 второй его значение, следующй объект хендл атрибута2 и его значение и тд
/// [1, 0.55, 2, 0.3455 ...]
/// \param buffer
/// \param size
/// \return
///
std::string help(unsigned char* buffer, std::size_t size);


#endif // HELPER_TS_H
